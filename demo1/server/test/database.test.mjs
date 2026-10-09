import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import initSqlJs from 'sql.js';

const courseCatalogSeed = JSON.parse(
  await readFile(new URL('../data/course-catalog.seed.json', import.meta.url), 'utf8'),
);
const preservedSeedCourse = courseCatalogSeed[0];
const relationalSeedCourse = courseCatalogSeed.find(course =>
  course.slug !== preservedSeedCourse.slug
  &&
  Array.isArray(course.modules) && course.modules.some(module =>
    (Array.isArray(module.lessons) && module.lessons.length > 0)
    || (Array.isArray(module.topics) && module.topics.length > 0),
  ),
);
const backfillSeedCourse = courseCatalogSeed.find(course =>
  course.slug !== preservedSeedCourse.slug && course.slug !== relationalSeedCourse.slug,
);

let temporaryDirectory;
let databasePath;
let database;
let existingAdminId;

before(async () => {
  temporaryDirectory = await mkdtemp(join(tmpdir(), 'global-academy-db-test-'));
  databasePath = join(temporaryDirectory, 'legacy.sqlite');
  existingAdminId = 'legacy-admin-id';

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_DRIVER = 'sqlite';
  process.env.DATABASE_PATH = databasePath;
  process.env.APP_ORIGIN = 'http://localhost:5173';
  process.env.JWT_SECRET = 'test-secret-long-enough-for-session-token-signing';
  process.env.ADMIN_EMAIL = 'admin@example.test';
  process.env.ADMIN_PASSWORD = 'TestAdminPassword123!';
  process.env.SUPER_ADMIN_EMAIL = 'superadmin@example.test';
  process.env.SUPER_ADMIN_PASSWORD = 'TestSuperAdminPassword123!';

  const SQL = await initSqlJs();
  const legacy = new SQL.Database();
  legacy.run(`
    CREATE TABLE admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  legacy.run(
    `INSERT INTO admin_users (id, email, password_hash, role)
     VALUES (?, ?, ?, 'ADMIN')`,
    [existingAdminId, 'admin@example.test', bcrypt.hashSync('OldTestPassword123!', 4)],
  );
  legacy.run(`
    CREATE TABLE enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      course TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT NOT NULL,
      assigned_to TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT ''
    )
  `);
  legacy.run(
    `INSERT INTO enquiries
       (id, name, email, phone, course, message, status, source, created_at, updated_at)
     VALUES ('legacy-enquiry', 'Legacy', 'legacy@example.test', '12345678',
       '', '', 'new', 'test', '2025-01-01', '2025-01-01')`,
  );
  legacy.run(`
    CREATE TABLE cms_records (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      slug TEXT NOT NULL,
      content_json TEXT NOT NULL,
      published_json TEXT,
      status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
      archived_from_status TEXT CHECK (archived_from_status IN ('draft', 'published')),
      created_by TEXT NOT NULL,
      created_role TEXT NOT NULL CHECK (created_role IN ('ADMIN', 'SUPER_ADMIN')),
      updated_by TEXT NOT NULL,
      updated_role TEXT NOT NULL CHECK (updated_role IN ('ADMIN', 'SUPER_ADMIN')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT,
      archived_at TEXT,
      draft_updated_at TEXT,
      UNIQUE (section, slug)
    )
  `);
  const legacyCourse = {
    title: 'Migrated course',
    modules: [{ id: 'legacy-module', title: 'Legacy module', topics: ['Legacy lesson'] }],
  };
  legacy.run(
    `INSERT INTO cms_records (
      id, section, slug, content_json, published_json, status, created_by,
      created_role, updated_by, updated_role, created_at, updated_at, published_at
    ) VALUES (?, 'courses', ?, ?, ?, 'published', ?, 'ADMIN', ?, 'ADMIN', ?, ?, ?)`,
    [
      'legacy-course-record', 'legacy-course', JSON.stringify(legacyCourse),
      JSON.stringify(legacyCourse), existingAdminId, existingAdminId,
      '2025-01-01', '2025-01-01', '2025-01-01',
    ],
  );
  legacy.run(
    `INSERT INTO cms_records (
      id, section, slug, content_json, published_json, status, created_by,
      created_role, updated_by, updated_role, created_at, updated_at, published_at
    ) VALUES (?, 'courses', ?, ?, ?, 'published', ?, 'ADMIN', ?, 'ADMIN', ?, ?, ?)`,
    [
      'preserved-seed-course', preservedSeedCourse.slug,
      JSON.stringify({ title: 'Existing record must win' }),
      JSON.stringify({ title: 'Existing record must win' }),
      existingAdminId, existingAdminId, '2025-01-01', '2025-01-01', '2025-01-01',
    ],
  );
  const incompleteSeedCourse = {
    id: `catalog-course-${backfillSeedCourse.slug}`,
    slug: backfillSeedCourse.slug,
    title: 'Admin-edited title',
  };
  legacy.run(
    `INSERT INTO cms_records (
      id, section, slug, content_json, published_json, status, created_by,
      created_role, updated_by, updated_role, created_at, updated_at, published_at
    ) VALUES (?, 'courses', ?, ?, ?, 'published', ?, 'SUPER_ADMIN', ?, 'SUPER_ADMIN', ?, ?, ?)`,
    [
      incompleteSeedCourse.id, incompleteSeedCourse.slug,
      JSON.stringify(incompleteSeedCourse), JSON.stringify(incompleteSeedCourse),
      existingAdminId, existingAdminId, '2025-01-01', '2025-01-01', '2025-01-01',
    ],
  );
  await writeFile(databasePath, Buffer.from(legacy.export()));
  legacy.close();

  database = await import('../dist/db.js');
  await database.initializeDatabase();
});

after(async () => {
  if (database) await database.closeDataDatabase();
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
});

test('applies versioned migrations and preserves existing SQLite records', async () => {
  const admin = await database.findAdminByEmail('admin@example.test');
  assert.equal(admin?.id, existingAdminId);
  assert.equal(await bcrypt.compare('OldTestPassword123!', admin.password_hash), true);
  assert.equal(await bcrypt.compare('TestAdminPassword123!', admin.password_hash), false);

  const dataLayer = await import('../dist/database.js');
  const migrationRows = await dataLayer.getDataDatabase().query(
    'SELECT id FROM schema_migrations ORDER BY id',
  );
  assert.deepEqual(migrationRows.rows.map(row => row.id), [
    '001_initial_schema',
    '002_indexes_and_enquiry_follow_up',
    '003_unified_identity_sessions_rbac',
    '004_course_hierarchy_and_cms_roles',
    '005_database_course_catalog',
    '006_backfill_catalog_course_details',
  ]);

  const identity = await database.findIdentityByEmail('admin@example.test');
  assert.equal(identity?.id, existingAdminId);
  assert.equal(identity?.role, 'ADMIN');
  assert.equal(identity?.email_verified, 1);
  assert.ok((await database.listIdentityPermissions('ADMIN')).includes('enquiries.read'));
  const migratedCourse = await database.findCmsRecord('courses', 'legacy-course');
  assert.equal(migratedCourse?.id, 'legacy-course-record');
  const migratedStructure = await database.getCourseStructure('legacy-course-record');
  assert.equal(migratedStructure[0].title, 'Legacy module');
  assert.equal(migratedStructure[0].lessons[0].title, 'Legacy lesson');
  const preservedCourse = await database.findCmsRecord('courses', preservedSeedCourse.slug);
  assert.equal(preservedCourse?.id, 'preserved-seed-course');
  assert.equal(preservedCourse?.content.title, 'Existing record must win');
  const seededCourseCount = await dataLayer.getDataDatabase().query(
    "SELECT COUNT(*) AS count FROM cms_records WHERE section = 'courses' AND id LIKE 'catalog-course-%'",
  );
  assert.equal(seededCourseCount.rows[0].count, courseCatalogSeed.length - 1);
  const backfilledCourse = await database.findCmsRecord('courses', backfillSeedCourse.slug);
  assert.equal(backfilledCourse?.content.learnerCount, backfillSeedCourse.learnerCount);
  assert.equal(backfilledCourse?.content.rating, backfillSeedCourse.rating);
  assert.equal(backfilledCourse?.publishedContent.learnerCount, backfillSeedCourse.learnerCount);
  assert.equal(backfilledCourse?.publishedContent.rating, backfillSeedCourse.rating);
  assert.equal(backfilledCourse?.publishedContent.longDescription, backfillSeedCourse.longDescription);
  assert.deepEqual(backfilledCourse?.publishedContent.modules, backfillSeedCourse.modules);
  assert.equal(
    backfilledCourse?.publishedContent.instructor?.name,
    backfillSeedCourse.instructor.name,
  );
  assert.equal(backfilledCourse?.content.title, 'Admin-edited title');
  assert.equal(backfilledCourse?.publishedContent.title, 'Admin-edited title');
  const seededCourse = await database.findCmsRecord('courses', relationalSeedCourse.slug);
  assert.equal(seededCourse?.status, 'published');
  const seededStructure = await database.getCourseStructure(seededCourse.id);
  assert.ok(seededStructure.length > 0);
  assert.ok(seededStructure.some(module => module.lessons.length > 0));
  const roles = await database.listIdentityRoles();
  assert.deepEqual(roles.map(role => role.name).sort(), [
    'ADMIN', 'CONTENT_MANAGER', 'STUDENT', 'SUPER_ADMIN', 'TRAINER',
  ]);
  assert.equal(
    await database.replaceIdentityRolePermissions(
      'CONTENT_MANAGER',
      ['content.read', 'content.update'],
      identity.id,
      '127.0.0.1',
    ),
    true,
  );
  assert.deepEqual(
    await database.listIdentityPermissions('CONTENT_MANAGER'),
    ['content.read', 'content.update'],
  );
  assert.equal(
    await database.replaceIdentityRolePermissions(
      'SUPER_ADMIN',
      [],
      identity.id,
      '127.0.0.1',
    ),
    false,
  );

  const legacyEnquiry = (await database.listEnquiries())
    .find(enquiry => enquiry.id === 'legacy-enquiry');
  assert.equal(legacyEnquiry?.email, 'legacy@example.test');
  assert.equal(legacyEnquiry?.followUpDate, null);

  await assert.rejects(database.initializeDatabase(), /already been initialized/);
});

test('does not replace existing admin credentials from environment on restart', async () => {
  await database.closeDataDatabase();
  await database.initializeDatabase();

  const admin = await database.findAdminByEmail('admin@example.test');
  assert.ok(admin);
  assert.equal(await bcrypt.compare('OldTestPassword123!', admin.password_hash), true);
  assert.equal(await bcrypt.compare('TestAdminPassword123!', admin.password_hash), false);
});

test('verification tokens are single-use and password reset revokes existing sessions', async () => {
  const { createHash, randomUUID } = await import('node:crypto');
  const auth = await import('../dist/auth.js');
  const email = 'new-student@example.test';
  const userId = await database.createStudentAccount({
    email,
    fullName: 'New Student',
    passwordHash: await bcrypt.hash('InitialPassword123!', 4),
    phone: '12345678',
    country: 'Testland',
    city: 'Test City',
    education: '',
    experience: '',
    interestedCourse: '',
    mode: 'online',
    careerGoal: '',
  });

  const verificationToken = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
  const verificationHash = createHash('sha256').update(verificationToken).digest('hex');
  await database.createEmailVerificationToken(
    userId,
    verificationHash,
    new Date(Date.now() + 60_000).toISOString(),
  );
  assert.equal(await database.verifyIdentityEmail(verificationHash, '127.0.0.1'), true);
  assert.equal(await database.verifyIdentityEmail(verificationHash, '127.0.0.1'), false);
  assert.equal((await database.findIdentityByEmail(email))?.email_verified, 1);

  const session = await auth.createSessionToken(userId, 'test-agent', '127.0.0.1');
  assert.ok(await database.getAuthenticatedSession(
    session.sessionId,
    auth.hashSecret(session.token),
  ));

  const resetToken = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
  const resetHash = createHash('sha256').update(resetToken).digest('hex');
  await database.createPasswordResetToken(
    userId,
    resetHash,
    new Date(Date.now() + 60_000).toISOString(),
  );
  assert.equal(
    await database.resetIdentityPassword(
      resetHash,
      await bcrypt.hash('ReplacementPassword456!', 4),
      '127.0.0.1',
    ),
    true,
  );
  assert.equal(
    await database.resetIdentityPassword(resetHash, 'unused', '127.0.0.1'),
    false,
  );
  assert.equal(await database.getAuthenticatedSession(
    session.sessionId,
    auth.hashSecret(session.token),
  ), undefined);
  assert.equal(
    await bcrypt.compare(
      'ReplacementPassword456!',
      (await database.findIdentityByEmail(email)).password_hash,
    ),
    true,
  );

  assert.equal(
    await database.updateManagedIdentity({
      actorId: existingAdminId,
      actorRole: 'ADMIN',
      targetId: userId,
      role: 'SUPER_ADMIN',
      ipAddress: '127.0.0.1',
    }),
    false,
  );
  const superAdmin = await database.findIdentityByEmail('superadmin@example.test');
  assert.ok(superAdmin);
  assert.equal(
    await database.updateManagedIdentity({
      actorId: existingAdminId,
      actorRole: 'ADMIN',
      targetId: superAdmin.id,
      isActive: false,
      ipAddress: '127.0.0.1',
    }),
    false,
  );
  assert.equal(
    await database.updateManagedIdentity({
      actorId: existingAdminId,
      actorRole: 'ADMIN',
      targetId: userId,
      role: 'CONTENT_MANAGER',
      ipAddress: '127.0.0.1',
    }),
    true,
  );
  const changedSession = await auth.createSessionToken(userId, 'test-agent', '127.0.0.1');
  assert.equal(
    await database.updateManagedIdentity({
      actorId: existingAdminId,
      actorRole: 'ADMIN',
      targetId: userId,
      isActive: false,
      ipAddress: '127.0.0.1',
    }),
    true,
  );
  assert.equal(await database.getAuthenticatedSession(
    changedSession.sessionId,
    auth.hashSecret(changedSession.token),
  ), undefined);
});

test('uses transactions for enquiry, newsletter, and CMS operations', async () => {
  const enquiry = await database.createEnquiry({
    name: 'Smoke Test',
    email: 'smoke@example.test',
    phone: '12345678',
    course: 'Test course',
    message: 'Persistence check',
    source: 'automated-test',
  });
  assert.equal(
    (await database.listEnquiries()).some(record => record.id === enquiry.id),
    true,
  );
  const updated = await database.updateEnquiry(enquiry.id, {
    status: 'contacted',
    assignedTo: 'admin',
    followUpDate: null,
    notes: 'Automated test',
  });
  assert.equal(updated?.status, 'contacted');

  assert.equal(await database.subscribeNewsletter('smoke@example.test'), true);
  assert.equal(await database.subscribeNewsletter('smoke@example.test'), false);

  const admin = await database.findAdminByEmail('admin@example.test');
  assert.ok(admin);
  const actor = { id: admin.id, role: admin.role };
  const draft = await database.createCmsRecord(
    'courses',
    'database-test-course',
    { title: 'Database test course' },
    actor,
  );
  assert.equal(draft.status, 'draft');
  await assert.rejects(
    database.createCmsRecord(
      'courses',
      'database-test-course',
      { title: 'Duplicate' },
      actor,
    ),
    /CMS_SLUG_EXISTS/,
  );
  const upserted = await database.upsertCmsRecord(
    'courses',
    'database-test-course',
    { title: 'Updated test course' },
    actor,
  );
  assert.equal(upserted?.created, false);
  const published = await database.publishCmsRecord(
    'courses',
    'database-test-course',
    actor,
  );
  assert.equal(published?.status, 'published');
  assert.equal(
    (await database.listPublishedCmsRecords('courses'))
      .some(record => record.slug === 'database-test-course'),
    true,
  );
});

test('persists ordered course modules and lessons and supports content-manager authorship', async () => {
  const { id: adminId } = await database.findIdentityByEmail('admin@example.test');
  const actor = { id: adminId, role: 'CONTENT_MANAGER' };
  const created = await database.createCmsRecord('courses', 'relational-course', {
    title: 'Relational Course',
    modules: [
      {
        id: 'module-one',
        title: 'Introduction',
        duration: '30 minutes',
        topics: ['Welcome', 'Setup'],
      },
      {
        id: 'module-two',
        title: 'Advanced topics',
        lessons: [
          {
            id: 'lesson-deep-dive',
            title: 'Deep dive',
            summary: 'Advanced lesson',
            videoUrl: 'https://example.test/video',
            isPreview: true,
          },
        ],
      },
    ],
  }, actor);

  let structure = await database.getCourseStructure(created.id);
  assert.deepEqual(structure.map(module => module.position), [0, 1]);
  assert.deepEqual(structure[0].lessons.map(lesson => lesson.title), ['Welcome', 'Setup']);
  assert.equal(structure[1].lessons[0].isPreview, true);
  const stableModuleId = structure[0].id;

  const updated = await database.upsertCmsRecord('courses', 'relational-course', {
    title: 'Relational Course',
    modules: [
      {
        id: 'module-one',
        title: 'Introduction updated',
        topics: ['Welcome', 'Setup'],
      },
      {
        id: 'module-two',
        title: 'Advanced topics',
        lessons: [{ id: 'lesson-deep-dive', title: 'Deep dive updated' }],
      },
    ],
  }, actor);
  assert.equal(updated?.created, false);
  structure = await database.getCourseStructure(created.id);
  assert.equal(structure[0].id, stableModuleId);
  assert.equal(structure[0].title, 'Introduction updated');
  assert.equal(structure[1].lessons[0].title, 'Deep dive updated');
});
