import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { after, before, test } from 'node:test';

let temporaryDirectory;
let serverProcess;
let baseUrl;
let serverEnvironment;
let serverPort;
let studentSessionToken;
let trainerSessionToken;
let adminPassword = 'AdminIntegrationPassword123!';
let superAdminPassword = 'SuperAdminIntegrationPassword123!';
let studentPassword = 'StudentIntegrationPassword123!';
let trainerPassword = 'TrainerIntegrationPassword123!';
let startupOutput = '';

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
  return address.port;
}

async function waitForApi(child) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`API exited during startup.\n${startupOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error(`API did not become ready.\n${startupOutput}`);
}

async function startApi() {
  serverProcess = spawn(process.execPath, [join(process.cwd(), 'dist', 'index.js')], {
    cwd: process.cwd(),
    env: serverEnvironment,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.setEncoding('utf8').on('data', chunk => { startupOutput += chunk; });
  serverProcess.stderr.setEncoding('utf8').on('data', chunk => { startupOutput += chunk; });
  await waitForApi(serverProcess);
}

async function stopApi() {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  const child = serverProcess;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 5_000))]);
  if (child.exitCode === null) {
    child.kill();
    await Promise.race([once(child, 'exit'), new Promise(resolve => setTimeout(resolve, 1_000))]);
  }
}

async function login(email, password) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173',
    },
    body: JSON.stringify({ email, password }),
  });
}

function cookieFrom(response) {
  const value = response.headers.get('set-cookie');
  assert.ok(value, 'Expected a session cookie.');
  return value.split(';', 1)[0];
}

before(async () => {
  temporaryDirectory = await mkdtemp(join(tmpdir(), 'global-academy-auth-http-'));
  const databasePath = join(temporaryDirectory, 'auth.sqlite');
  serverPort = await availablePort();

  serverEnvironment = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: String(serverPort),
    APP_ORIGIN: 'http://localhost:5173',
    DATABASE_DRIVER: 'sqlite',
    DATABASE_PATH: databasePath,
    JWT_SECRET: 'phase-two-integration-secret-at-least-32-bytes',
    ADMIN_EMAIL: 'admin@phase-two.test',
    ADMIN_PASSWORD: adminPassword,
    SUPER_ADMIN_EMAIL: 'superadmin@phase-two.test',
    SUPER_ADMIN_PASSWORD: superAdminPassword,
    RESEND_API_KEY: '',
    EMAIL_FROM: '',
  };

  for (const [name, value] of Object.entries(serverEnvironment)) {
    process.env[name] = value;
  }
  const database = await import('../dist/db.js');
  const auth = await import('../dist/auth.js');
  await database.initializeDatabase();

  const studentId = await database.createStudentAccount({
    email: 'student@phase-two.test',
    fullName: 'Integration Student',
    passwordHash: await bcrypt.hash(studentPassword, 4),
    phone: '12345678',
    country: 'Testland',
    city: '',
    education: '',
    experience: '',
    interestedCourse: '',
    mode: 'online',
    careerGoal: '',
  });
  const trainerId = await database.createStudentAccount({
    email: 'trainer@phase-two.test',
    fullName: 'Integration Trainer',
    passwordHash: await bcrypt.hash(trainerPassword, 4),
    phone: '12345678',
    country: 'Testland',
    city: '',
    education: '',
    experience: '',
    interestedCourse: '',
    mode: 'online',
    careerGoal: '',
  });

  const dataDatabase = (await import('../dist/database.js')).getDataDatabase();
  await dataDatabase.transaction(async () => {
    await dataDatabase.execute(
      'UPDATE users SET email_verified = 1 WHERE id IN (?, ?)',
      [studentId, trainerId],
    );
    await dataDatabase.execute(
      `UPDATE user_roles SET role_id = 'role_trainer' WHERE user_id = ?`,
      [trainerId],
    );
  });
  const expiredSession = await auth.createSessionToken(studentId, 'integration-test', '127.0.0.1');
  studentSessionToken = expiredSession.token;
  await dataDatabase.transaction(async () => {
    await dataDatabase.execute(
      'UPDATE sessions SET expires_at = ? WHERE id = ?',
      [new Date(Date.now() - 60_000).toISOString(), expiredSession.sessionId],
    );
  });
  const trainerSession = await auth.createSessionToken(trainerId, 'integration-test', '127.0.0.1');
  trainerSessionToken = trainerSession.token;
  await database.closeDataDatabase();

  baseUrl = `http://127.0.0.1:${serverPort}`;
  await startApi();
});

after(async () => {
  await stopApi();
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
});

test('auth routes enforce sessions, role permissions, expiry, and login throttling', async () => {
  const seededCatalogResponse = await fetch(`${baseUrl}/api/content/courses`);
  assert.equal(seededCatalogResponse.status, 200);
  const seededCatalog = await seededCatalogResponse.json();
  assert.equal(seededCatalog.records.length, 175);
  assert.ok(seededCatalog.records.some(record => record.slug === 'aws-training'));

  const unauthenticated = await fetch(`${baseUrl}/api/admin/session`);
  assert.equal(unauthenticated.status, 401);

  const forged = await fetch(`${baseUrl}/api/admin/session`, {
    headers: { Cookie: 'gma_session=not-a-valid-token' },
  });
  assert.equal(forged.status, 401);

  const invalidLogin = await login('admin@phase-two.test', 'IncorrectIntegrationPassword!');
  assert.equal(invalidLogin.status, 401);
  const invalidBody = await invalidLogin.text();
  assert.equal(invalidBody.includes('password_hash'), false);
  assert.equal(invalidBody.includes('IncorrectIntegrationPassword!'), false);

  const expiredSession = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: `gma_session=${studentSessionToken}` },
  });
  assert.equal(expiredSession.status, 401);

  const trainerExistingSession = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: `gma_session=${trainerSessionToken}` },
  });
  assert.equal(trainerExistingSession.status, 200);
  assert.equal((await trainerExistingSession.json()).user.role, 'TRAINER');

  const studentLogin = await login('student@phase-two.test', studentPassword);
  assert.equal(studentLogin.status, 200);
  const studentCookie = cookieFrom(studentLogin);
  const studentUser = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: studentCookie },
  });
  assert.equal(studentUser.status, 200);
  assert.equal((await studentUser.json()).user.role, 'STUDENT');
  const studentAdminAccess = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { Cookie: studentCookie },
  });
  assert.equal(studentAdminAccess.status, 403);

  const trainerLogin = await login('trainer@phase-two.test', trainerPassword);
  assert.equal(trainerLogin.status, 200);
  const trainerAdminAccess = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { Cookie: cookieFrom(trainerLogin) },
  });
  assert.equal(trainerAdminAccess.status, 403);

  const adminLogin = await login('admin@phase-two.test', adminPassword);
  assert.equal(adminLogin.status, 200);
  const adminCookie = cookieFrom(adminLogin);
  const adminUsers = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(adminUsers.status, 200);
  const adminUsersBody = await adminUsers.text();
  assert.equal(adminUsersBody.includes('password_hash'), false);

  const enquiryResponse = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173',
    },
    body: JSON.stringify({
      name: 'Website Enquiry',
      email: 'enquiry@phase-two.test',
      phone: '12345678',
      course: 'CMS course',
      message: 'Please share the next batch details.',
      source: 'Website Form',
    }),
  });
  assert.equal(enquiryResponse.status, 201);
  const submittedEnquiry = (await enquiryResponse.json()).enquiry;
  const adminEnquiries = await fetch(`${baseUrl}/api/admin/enquiries`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(adminEnquiries.status, 200);
  assert.ok((await adminEnquiries.json()).enquiries.some(enquiry =>
    enquiry.id === submittedEnquiry.id
      && enquiry.course === 'CMS course'
      && enquiry.message === 'Please share the next batch details.',
  ));

  const superAdminLogin = await login('superadmin@phase-two.test', superAdminPassword);
  assert.equal(superAdminLogin.status, 200);
  const superAdminCookie = cookieFrom(superAdminLogin);
  const auditLogs = await fetch(`${baseUrl}/api/admin/audit-logs`, {
    headers: { Cookie: superAdminCookie },
  });
  assert.equal(auditLogs.status, 200);

  const courseSlug = 'phase-three-course';
  const courseContent = {
    title: 'Phase Three Course',
    category: 'cloud-computing',
    level: 'Beginner',
    duration: '2 hours',
    shortDescription: 'A course for API integration tests.',
    longDescription: 'Course content persists through its complete publishing lifecycle.',
    thumbnail: 'https://example.test/course.png',
    price: 100,
    discountPrice: 80,
    currency: 'USD',
    modules: [{
      id: 'phase-three-module',
      title: 'Getting Started',
      lessons: [{
        id: 'phase-three-lesson',
        title: 'Welcome',
        summary: 'Introductory lesson',
        content: { text: 'Persistent course lesson content.' },
        durationMinutes: 10,
        position: 0,
        isPreview: true,
        status: 'published',
      }],
    }],
  };
  const adminMutationHeaders = {
    Cookie: adminCookie,
    Origin: 'http://localhost:5173',
    'Content-Type': 'application/json',
  };
  const createCourse = await fetch(`${baseUrl}/api/admin/content/courses`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ slug: courseSlug, content: courseContent }),
  });
  assert.equal(createCourse.status, 201);
  const createdCourse = (await createCourse.json()).record;
  assert.equal(createdCourse.status, 'draft');

  const courseDetail = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(courseDetail.status, 200);
  const courseDetails = await courseDetail.json();
  assert.equal(courseDetails.structure[0].lessons[0].title, 'Welcome');

  const updatedContent = { ...courseContent, title: 'Updated Phase Three Course' };
  const updateCourse = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}`, {
    method: 'PUT',
    headers: adminMutationHeaders,
    body: JSON.stringify({ content: updatedContent }),
  });
  assert.equal(updateCourse.status, 200);
  assert.equal((await updateCourse.json()).record.content.title, updatedContent.title);

  const archiveCourse = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}/archive`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(archiveCourse.status, 200);
  assert.equal((await archiveCourse.json()).record.status, 'archived');

  const restoreCourse = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}/restore`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(restoreCourse.status, 200);
  assert.equal((await restoreCourse.json()).record.status, 'draft');

  const publishCourse = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}/publish`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(publishCourse.status, 200);
  assert.equal((await publishCourse.json()).record.status, 'published');

  const publicCourse = await fetch(`${baseUrl}/api/content/courses/${courseSlug}`);
  assert.equal(publicCourse.status, 200);
  assert.equal(publicCourse.headers.get('cache-control'), 'no-store');
  assert.equal((await publicCourse.json()).record.content.title, updatedContent.title);
  const publicCatalog = await fetch(`${baseUrl}/api/content/courses`);
  assert.equal(publicCatalog.status, 200);
  assert.equal(publicCatalog.headers.get('cache-control'), 'no-store');
  assert.ok((await publicCatalog.json()).records.some(record =>
    record.slug === courseSlug && record.content.title === updatedContent.title,
  ));

  const unpublishCourse = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}/unpublish`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(unpublishCourse.status, 200);
  const unpublishedRecord = (await unpublishCourse.json()).record;
  assert.equal(unpublishedRecord.status, 'draft');
  assert.equal(unpublishedRecord.publishedContent, null);

  await stopApi();
  await startApi();
  const afterRestart = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(afterRestart.status, 200);
  assert.equal((await afterRestart.json()).record.content.title, updatedContent.title);

  const noLongerPublic = await fetch(`${baseUrl}/api/content/courses/${courseSlug}`);
  assert.equal(noLongerPublic.status, 404);
  const cmsAuditLogs = await fetch(`${baseUrl}/api/admin/audit-logs?pageSize=100`, {
    headers: { Cookie: superAdminCookie },
  });
  assert.equal(cmsAuditLogs.status, 200);
  const auditEntries = (await cmsAuditLogs.json()).data.entries;
  for (const action of [
    'cms.record.created',
    'cms.record.updated',
    'cms.record.archived',
    'cms.record.restored',
    'cms.record.published',
    'cms.record.unpublished',
  ]) {
    assert.ok(auditEntries.some(entry => entry.action === action), `Missing CMS audit event: ${action}`);
  }

  const logout = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Cookie: adminCookie,
      Origin: 'http://localhost:5173',
    },
  });
  assert.equal(logout.status, 204);
  const revokedSession = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(revokedSession.status, 401);

  let rateLimited = false;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await login('unknown@phase-two.test', 'IncorrectIntegrationPassword!');
    if (response.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert.equal(rateLimited, true, 'Repeated login attempts must be rate limited.');

});
