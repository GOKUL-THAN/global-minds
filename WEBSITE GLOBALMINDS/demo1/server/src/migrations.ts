import type { DataDatabase } from './database.js';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Migration {
  id: string;
  up(database: DataDatabase): Promise<void>;
}

const migrations: Migration[] = [
  {
    id: '001_initial_schema',
    async up(database) {
      await database.execute(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `);
      await database.execute(`
        CREATE TABLE IF NOT EXISTS student_users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          full_name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          phone TEXT NOT NULL,
          country TEXT NOT NULL,
          city TEXT NOT NULL DEFAULT '',
          education TEXT NOT NULL DEFAULT '',
          experience TEXT NOT NULL DEFAULT '',
          interested_course TEXT NOT NULL DEFAULT '',
          mode TEXT NOT NULL DEFAULT '',
          career_goal TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          email_verified INTEGER NOT NULL DEFAULT 0
        )
      `);
      await database.execute(`
        CREATE TABLE IF NOT EXISTS enquiries (
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
          notes TEXT NOT NULL DEFAULT '',
          follow_up_date TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          email TEXT PRIMARY KEY,
          subscribed_at TEXT NOT NULL
        )
      `);
      await database.execute(`
        CREATE TABLE IF NOT EXISTS cms_records (
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
    },
  },
  {
    id: '002_indexes_and_enquiry_follow_up',
    async up(database) {
      if (!(await database.hasColumn('enquiries', 'follow_up_date'))) {
        await database.execute('ALTER TABLE enquiries ADD COLUMN follow_up_date TEXT');
      }
      await database.execute(
        'CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at)',
      );
      await database.execute(
        'CREATE INDEX IF NOT EXISTS cms_records_section_status_updated_idx ON cms_records (section, status, updated_at)',
      );
      await database.execute(
        'CREATE INDEX IF NOT EXISTS student_users_active_email_verified_idx ON student_users (is_active, email_verified)',
      );
      await database.execute(
        'CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_lower_idx ON admin_users (lower(email))',
      );
      await database.execute(
        'CREATE UNIQUE INDEX IF NOT EXISTS student_users_email_lower_idx ON student_users (lower(email))',
      );
      await database.execute(
        'CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_idx ON newsletter_subscribers (lower(email))',
      );
    },
  },
  {
    id: '003_unified_identity_sessions_rbac',
    async up(database) {
      const admins = await database.query<{
        id: string;
        email: string;
        password_hash: string;
        role: 'ADMIN' | 'SUPER_ADMIN';
        is_active: number;
        created_at: string;
      }>(
        'SELECT id, email, password_hash, role, is_active, created_at FROM admin_users ORDER BY created_at',
      );
      const students = await database.query<{
        id: string;
        email: string;
        full_name: string;
        password_hash: string;
        phone: string;
        country: string;
        city: string;
        education: string;
        experience: string;
        interested_course: string;
        mode: string;
        career_goal: string;
        created_at: string;
        is_active: number;
        email_verified: number;
      }>(
        `SELECT id, email, full_name, password_hash, phone, country, city, education,
          experience, interested_course, mode, career_goal, created_at, is_active, email_verified
         FROM student_users ORDER BY created_at`,
      );

      const identities = new Map<string, string>();
      for (const account of admins.rows) {
        const email = account.email.trim().toLowerCase();
        if (identities.has(email)) {
          throw new Error(`Cannot migrate duplicate legacy identity email: ${email}`);
        }
        identities.set(email, account.id);
      }
      for (const account of students.rows) {
        const email = account.email.trim().toLowerCase();
        if (identities.has(email)) {
          throw new Error(`Cannot migrate duplicate legacy identity email: ${email}`);
        }
        identities.set(email, account.id);
      }

      await database.execute(`
        CREATE TABLE roles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '',
          is_system INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      await database.execute(`
        CREATE TABLE permissions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT ''
        )
      `);
      await database.execute(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL DEFAULT '',
          last_name TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          is_active INTEGER NOT NULL DEFAULT 1,
          email_verified INTEGER NOT NULL DEFAULT 0,
          email_verified_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          last_login_at TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE user_roles (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
          assigned_at TEXT NOT NULL,
          assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      await database.execute(`
        CREATE TABLE role_permissions (
          role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          PRIMARY KEY (role_id, permission_id)
        )
      `);
      await database.execute(`
        CREATE TABLE student_profiles (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          country TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          education TEXT NOT NULL DEFAULT '',
          experience TEXT NOT NULL DEFAULT '',
          interested_course TEXT NOT NULL DEFAULT '',
          learning_mode TEXT NOT NULL DEFAULT '',
          career_goal TEXT NOT NULL DEFAULT '',
          updated_at TEXT NOT NULL
        )
      `);
      await database.execute(`
        CREATE TABLE sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          user_agent TEXT NOT NULL DEFAULT '',
          ip_address TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          revoked_at TEXT,
          revoke_reason TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE email_verification_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used_at TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE password_reset_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used_at TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE audit_logs (
          id TEXT PRIMARY KEY,
          actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          action TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id TEXT,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          ip_address TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        )
      `);

      const roleNames = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'TRAINER', 'STUDENT'];
      const now = new Date().toISOString();
      for (const role of roleNames) {
        await database.execute(
          'INSERT INTO roles (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [`role_${role.toLowerCase()}`, role, now, now],
        );
      }
      const permissionNames = [
        'users.read', 'users.create', 'users.update', 'users.deactivate',
        'admins.read', 'admins.create', 'admins.update', 'admins.delete',
        'roles.read', 'roles.manage',
        'courses.read', 'courses.create', 'courses.update', 'courses.archive',
        'courses.delete', 'courses.publish',
        'categories.manage', 'content.read', 'content.create', 'content.update',
        'content.publish', 'content.archive', 'content.delete',
        'students.read', 'students.create', 'students.update', 'students.deactivate',
        'trainers.read', 'trainers.manage',
        'batches.read', 'batches.manage', 'attendance.read', 'attendance.manage',
        'enquiries.read', 'enquiries.update', 'certificates.read', 'certificates.manage',
        'reports.read', 'settings.manage', 'payments.read', 'audit_logs.read',
        'sessions.read', 'sessions.revoke',
        'profile.read', 'profile.update', 'enrollments.read.own',
        'courses.read.assigned', 'lessons.read.enrolled', 'progress.manage.own',
        'assignments.read.assigned', 'assignments.manage.assigned',
        'quizzes.read.enrolled', 'quizzes.attempt.own', 'certificates.read.own',
        'notifications.read.own',
      ];
      for (const permission of permissionNames) {
        await database.execute(
          'INSERT INTO permissions (id, name) VALUES (?, ?)',
          [`permission_${permission.replaceAll('.', '_')}`, permission],
        );
      }

      const rolePermissions: Record<string, string[]> = {
        SUPER_ADMIN: permissionNames,
        ADMIN: [
          'users.read', 'users.create', 'users.update', 'users.deactivate',
          'admins.read', 'admins.create', 'admins.update',
          'roles.read', 'courses.read', 'courses.create', 'courses.update',
          'courses.archive', 'courses.publish', 'categories.manage',
          'content.read', 'content.create', 'content.update', 'content.publish',
          'content.archive', 'students.read', 'students.create', 'students.update',
          'students.deactivate', 'trainers.read', 'trainers.manage',
          'batches.read', 'batches.manage', 'attendance.read', 'attendance.manage',
          'enquiries.read', 'enquiries.update', 'certificates.read',
          'certificates.manage', 'reports.read', 'payments.read', 'sessions.read',
          'sessions.revoke', 'profile.read', 'profile.update',
        ],
        CONTENT_MANAGER: [
          'courses.read', 'courses.create', 'courses.update', 'courses.archive',
          'courses.publish', 'categories.manage', 'content.read', 'content.create',
          'content.update', 'content.publish', 'content.archive',
          'profile.read', 'profile.update',
        ],
        TRAINER: [
          'courses.read.assigned', 'batches.read', 'students.read',
          'attendance.read', 'attendance.manage', 'assignments.read.assigned',
          'assignments.manage.assigned', 'quizzes.read.enrolled',
          'reports.read', 'profile.read', 'profile.update', 'sessions.read',
          'sessions.revoke',
        ],
        STUDENT: [
          'profile.read', 'profile.update', 'enrollments.read.own',
          'courses.read.assigned', 'lessons.read.enrolled', 'progress.manage.own',
          'assignments.read.assigned', 'quizzes.read.enrolled',
          'quizzes.attempt.own', 'certificates.read.own', 'notifications.read.own',
          'sessions.read', 'sessions.revoke',
        ],
      };
      for (const [role, permissions] of Object.entries(rolePermissions)) {
        for (const permission of permissions) {
          await database.execute(
            `INSERT INTO role_permissions (role_id, permission_id)
             VALUES (?, ?)`,
            [`role_${role.toLowerCase()}`, `permission_${permission.replaceAll('.', '_')}`],
          );
        }
      }

      for (const account of admins.rows) {
        const email = account.email.trim().toLowerCase();
        const createdAt = account.created_at || now;
        const verifiedAt = createdAt;
        await database.execute(
          `INSERT INTO users (
            id, email, password_hash, first_name, is_active, email_verified,
            email_verified_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
          [
            account.id, email, account.password_hash, email.split('@')[0],
            account.is_active, verifiedAt, createdAt, now,
          ],
        );
        await database.execute(
          `INSERT INTO user_roles (user_id, role_id, assigned_at)
           VALUES (?, ?, ?)`,
          [account.id, `role_${account.role.toLowerCase()}`, now],
        );
      }
      for (const account of students.rows) {
        const email = account.email.trim().toLowerCase();
        const nameParts = account.full_name.trim().split(/\s+/);
        const firstName = nameParts.shift() ?? '';
        const lastName = nameParts.join(' ');
        const createdAt = account.created_at || now;
        await database.execute(
          `INSERT INTO users (
            id, email, password_hash, first_name, last_name, phone, is_active,
            email_verified, email_verified_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            account.id, email, account.password_hash, firstName, lastName,
            account.phone, account.is_active, account.email_verified,
            account.email_verified ? createdAt : null, createdAt, now,
          ],
        );
        await database.execute(
          `INSERT INTO user_roles (user_id, role_id, assigned_at)
           VALUES (?, 'role_student', ?)`,
          [account.id, now],
        );
        await database.execute(
          `INSERT INTO student_profiles (
            user_id, country, city, education, experience, interested_course,
            learning_mode, career_goal, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            account.id, account.country, account.city, account.education,
            account.experience, account.interested_course, account.mode,
            account.career_goal, now,
          ],
        );
      }

      await database.execute('CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email))');
      await database.execute('CREATE INDEX user_roles_role_idx ON user_roles (role_id)');
      await database.execute('CREATE INDEX sessions_user_expires_idx ON sessions (user_id, expires_at)');
      await database.execute('CREATE INDEX audit_logs_actor_created_idx ON audit_logs (actor_user_id, created_at)');
      await database.execute('CREATE INDEX email_verification_tokens_user_idx ON email_verification_tokens (user_id, expires_at)');
      await database.execute('CREATE INDEX password_reset_tokens_user_idx ON password_reset_tokens (user_id, expires_at)');
      await database.execute('CREATE INDEX users_created_at_idx ON users (created_at)');
      await database.execute('CREATE INDEX roles_name_idx ON roles (name)');
      await database.execute('CREATE INDEX permissions_name_idx ON permissions (name)');
      await database.execute('CREATE INDEX audit_logs_resource_idx ON audit_logs (resource_type, resource_id, created_at)');
    },
  },
  {
    id: '004_course_hierarchy_and_cms_roles',
    async up(database) {
      await database.execute(`
        CREATE TABLE cms_records_replacement (
          id TEXT PRIMARY KEY,
          section TEXT NOT NULL,
          slug TEXT NOT NULL,
          content_json TEXT NOT NULL,
          published_json TEXT,
          status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
          archived_from_status TEXT CHECK (archived_from_status IN ('draft', 'published')),
          created_by TEXT NOT NULL,
          created_role TEXT NOT NULL CHECK (created_role IN ('ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER', 'TRAINER')),
          updated_by TEXT NOT NULL,
          updated_role TEXT NOT NULL CHECK (updated_role IN ('ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER', 'TRAINER')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          published_at TEXT,
          archived_at TEXT,
          draft_updated_at TEXT,
          UNIQUE (section, slug)
        )
      `);
      await database.execute(
        `INSERT INTO cms_records_replacement (
          id, section, slug, content_json, published_json, status, archived_from_status,
          created_by, created_role, updated_by, updated_role, created_at, updated_at,
          published_at, archived_at, draft_updated_at
        ) SELECT id, section, slug, content_json, published_json, status, archived_from_status,
          created_by, created_role, updated_by, updated_role, created_at, updated_at,
          published_at, archived_at, draft_updated_at FROM cms_records`,
      );
      await database.execute('DROP TABLE cms_records');
      await database.execute('ALTER TABLE cms_records_replacement RENAME TO cms_records');
      await database.execute(
        'CREATE INDEX cms_records_section_status_updated_idx ON cms_records (section, status, updated_at)',
      );
      await database.execute(`
        CREATE TABLE course_modules (
          id TEXT PRIMARY KEY,
          course_record_id TEXT NOT NULL REFERENCES cms_records(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          duration TEXT NOT NULL DEFAULT '',
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (course_record_id, position)
        )
      `);
      await database.execute(`
        CREATE TABLE course_lessons (
          id TEXT PRIMARY KEY,
          module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          summary TEXT NOT NULL DEFAULT '',
          content_json TEXT NOT NULL DEFAULT '{}',
          video_url TEXT NOT NULL DEFAULT '',
          document_url TEXT NOT NULL DEFAULT '',
          external_url TEXT NOT NULL DEFAULT '',
          duration_minutes INTEGER,
          position INTEGER NOT NULL,
          is_preview INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (module_id, position)
        )
      `);
      await database.execute(
        'CREATE INDEX course_modules_course_position_idx ON course_modules (course_record_id, position)',
      );
      await database.execute(
        'CREATE INDEX course_lessons_module_position_idx ON course_lessons (module_id, position)',
      );

      const courseRecords = await database.query<{
        id: string;
        content_json: string;
      }>("SELECT id, content_json FROM cms_records WHERE section = 'courses'");
      const now = new Date().toISOString();
      for (const record of courseRecords.rows) {
        let content: Record<string, unknown>;
        try {
          const parsed: unknown = JSON.parse(record.content_json);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue;
          content = parsed as Record<string, unknown>;
        } catch {
          continue;
        }
        const modules = Array.isArray(content.modules) ? content.modules : [];
        for (const [moduleIndex, item] of modules.entries()) {
          if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
          const module = item as Record<string, unknown>;
          const title = typeof module.title === 'string' ? module.title.trim() : '';
          if (!title) continue;
          const moduleId = typeof module.id === 'string' && module.id
            ? `${record.id}:module:${module.id}`
            : `course-module-${record.id}-${moduleIndex + 1}`;
          await database.execute(
            `INSERT INTO course_modules (
              id, course_record_id, title, description, duration, position, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              moduleId, record.id, title,
              typeof module.description === 'string' ? module.description : '',
              typeof module.duration === 'string' ? module.duration : '',
              moduleIndex, now, now,
            ],
          );
          const lessons = Array.isArray(module.lessons)
            ? module.lessons
            : Array.isArray(module.topics) ? module.topics : [];
          for (const [lessonIndex, lessonItem] of lessons.entries()) {
            const lesson = typeof lessonItem === 'string'
              ? { title: lessonItem }
              : lessonItem && typeof lessonItem === 'object' && !Array.isArray(lessonItem)
                ? lessonItem as Record<string, unknown>
                : undefined;
            const lessonTitle = typeof lesson?.title === 'string' ? lesson.title.trim() : '';
            if (!lessonTitle) continue;
            const lessonId = typeof lesson?.id === 'string' && lesson.id
              ? `${moduleId}:lesson:${lesson.id}`
              : `${moduleId}-lesson-${lessonIndex + 1}`;
            await database.execute(
              `INSERT INTO course_lessons (
                id, module_id, title, summary, content_json, video_url, document_url,
                external_url, duration_minutes, position, is_preview, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                lessonId, moduleId, lessonTitle,
                typeof lesson?.summary === 'string' ? lesson.summary : '',
                JSON.stringify(lesson && lesson.content && typeof lesson.content === 'object' ? lesson.content : {}),
                typeof lesson?.videoUrl === 'string' ? lesson.videoUrl : '',
                typeof lesson?.documentUrl === 'string' ? lesson.documentUrl : '',
                typeof lesson?.externalUrl === 'string' ? lesson.externalUrl : '',
                lesson && Number.isInteger(lesson.durationMinutes) ? lesson.durationMinutes as number : null,
                lessonIndex,
                lesson?.isPreview === true ? 1 : 0,
                lesson && (lesson.status === 'published' || lesson.status === 'archived') ? lesson.status : 'draft',
                now, now,
              ],
            );
          }
        }
      }
    },
  },
  {
    id: '005_database_course_catalog',
    async up(database) {
      const seedPath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/course-catalog.seed.json');
      const seedText = await readFile(seedPath, 'utf8');
      const seed: unknown = JSON.parse(seedText);
      if (!Array.isArray(seed)) throw new Error('Course catalog migration seed must be an array.');

      const now = new Date().toISOString();
      for (const courseValue of seed) {
        if (!courseValue || typeof courseValue !== 'object' || Array.isArray(courseValue)) {
          throw new Error('Course catalog migration contains an invalid course record.');
        }
        const course = courseValue as Record<string, unknown>;
        const slug = typeof course.slug === 'string' ? course.slug : '';
        const title = typeof course.title === 'string' ? course.title : '';
        if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug) || title.trim().length < 2) {
          throw new Error('Course catalog migration contains an invalid slug or title.');
        }
        const existing = await database.query<{ id: string }>(
          'SELECT id FROM cms_records WHERE section = ? AND slug = ?',
          ['courses', slug],
        );
        if (existing.rows.length) continue;

        const recordId = `catalog-course-${slug}`;
        const contentJson = JSON.stringify(course);
        await database.execute(
          `INSERT INTO cms_records (
            id, section, slug, content_json, published_json, status, created_by, created_role,
            updated_by, updated_role, created_at, updated_at, published_at
          ) VALUES (?, 'courses', ?, ?, ?, 'published', ?, 'SUPER_ADMIN', ?, 'SUPER_ADMIN', ?, ?, ?)`,
          [recordId, slug, contentJson, contentJson, 'system-course-catalog', 'system-course-catalog', now, now, now],
        );

        const modules = Array.isArray(course.modules) ? course.modules : [];
        for (const [modulePosition, moduleValue] of modules.entries()) {
          if (!moduleValue || typeof moduleValue !== 'object' || Array.isArray(moduleValue)) {
            throw new Error(`Course catalog module is invalid for ${slug}.`);
          }
          const module = moduleValue as Record<string, unknown>;
          const moduleTitle = typeof module.title === 'string' ? module.title.trim() : '';
          if (!moduleTitle) throw new Error(`Course catalog module title is missing for ${slug}.`);
          const moduleKey = typeof module.id === 'string' && module.id.trim()
            ? module.id.trim()
            : `position-${modulePosition}`;
          const moduleId = `${recordId}:module:${moduleKey}`;
          await database.execute(
            `INSERT INTO course_modules (
              id, course_record_id, title, description, duration, position, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              moduleId, recordId, moduleTitle,
              typeof module.description === 'string' ? module.description : '',
              typeof module.duration === 'string' ? module.duration : '',
              modulePosition, now, now,
            ],
          );
          const lessons = Array.isArray(module.lessons)
            ? module.lessons
            : Array.isArray(module.topics) ? module.topics : [];
          for (const [lessonPosition, lessonValue] of lessons.entries()) {
            const lesson = typeof lessonValue === 'string'
              ? { title: lessonValue }
              : lessonValue && typeof lessonValue === 'object' && !Array.isArray(lessonValue)
                ? lessonValue as Record<string, unknown>
                : undefined;
            const lessonTitle = typeof lesson?.title === 'string' ? lesson.title.trim() : '';
            if (!lessonTitle) throw new Error(`Course catalog lesson title is missing for ${slug}.`);
            const lessonKey = typeof lesson?.id === 'string' && lesson.id.trim()
              ? lesson.id.trim()
              : `position-${lessonPosition}`;
            const lessonId = `${moduleId}:lesson:${lessonKey}`;
            const lessonContent = lesson?.content && typeof lesson.content === 'object' && !Array.isArray(lesson.content)
              ? JSON.stringify(lesson.content)
              : '{}';
            const durationMinutes = typeof lesson?.durationMinutes === 'number'
              && Number.isInteger(lesson.durationMinutes)
              ? lesson.durationMinutes
              : null;
            await database.execute(
              `INSERT INTO course_lessons (
                id, module_id, title, summary, content_json, video_url, document_url,
                external_url, duration_minutes, position, is_preview, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                lessonId, moduleId, lessonTitle,
                typeof lesson?.summary === 'string' ? lesson.summary : '',
                lessonContent,
                typeof lesson?.videoUrl === 'string' ? lesson.videoUrl : '',
                typeof lesson?.documentUrl === 'string' ? lesson.documentUrl : '',
                typeof lesson?.externalUrl === 'string' ? lesson.externalUrl : '',
                durationMinutes, lessonPosition,
                lesson?.isPreview === true ? 1 : 0,
                lesson?.status === 'draft' || lesson?.status === 'archived' ? lesson.status : 'published',
                now, now,
              ],
            );
          }
        }
      }
    },
  },
  {
    id: '006_backfill_catalog_course_details',
    async up(database) {
      const seedPath = resolve(dirname(fileURLToPath(import.meta.url)), '../data/course-catalog.seed.json');
      const seedText = await readFile(seedPath, 'utf8');
      const seed: unknown = JSON.parse(seedText);
      if (!Array.isArray(seed)) throw new Error('Course catalog migration seed must be an array.');

      const mergeMissingFields = (source: unknown, current: unknown): unknown => {
        if (
          source && current
          && typeof source === 'object' && !Array.isArray(source)
          && typeof current === 'object' && !Array.isArray(current)
        ) {
          const merged: Record<string, unknown> = { ...(source as Record<string, unknown>) };
          for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
            merged[key] = key in merged ? mergeMissingFields(merged[key], value) : value;
          }
          return merged;
        }
        return current === undefined ? source : current;
      };

      const catalog = new Map<string, Record<string, unknown>>();
      for (const value of seed) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Course catalog migration contains an invalid course record.');
        }
        const course = value as Record<string, unknown>;
        if (typeof course.slug === 'string') catalog.set(course.slug, course);
      }

      const records = await database.query<{
        id: string;
        slug: string;
        content_json: string;
        published_json: string | null;
      }>(
        "SELECT id, slug, content_json, published_json FROM cms_records WHERE section = 'courses' AND id LIKE 'catalog-course-%'",
      );

      for (const record of records.rows) {
        const source = catalog.get(record.slug);
        if (!source || record.id !== `catalog-course-${record.slug}`) continue;

        const content = mergeMissingFields(source, JSON.parse(record.content_json));
        const publishedContent = record.published_json === null
          ? null
          : mergeMissingFields(source, JSON.parse(record.published_json));
        await database.execute(
          'UPDATE cms_records SET content_json = ?, published_json = ? WHERE id = ?',
          [
            JSON.stringify(content),
            publishedContent === null ? null : JSON.stringify(publishedContent),
            record.id,
          ],
        );
      }
    },
  },
  {
    id: '007_operational_modules',
    async up(database) {
      await database.execute(
        'ALTER TABLE student_profiles ADD COLUMN archived_at TEXT',
      );
      await database.execute(
        'ALTER TABLE student_profiles ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0',
      );
      await database.execute(`
        CREATE TABLE batches (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '',
          start_date TEXT,
          end_date TEXT,
          schedule_json TEXT NOT NULL DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'planned'
            CHECK (status IN ('planned', 'active', 'completed', 'cancelled', 'archived')),
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          archived_at TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE batch_students (
          batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
          student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assigned_at TEXT NOT NULL,
          PRIMARY KEY (batch_id, student_id)
        )
      `);
      await database.execute(`
        CREATE TABLE batch_trainers (
          batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
          trainer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assigned_at TEXT NOT NULL,
          PRIMARY KEY (batch_id, trainer_id)
        )
      `);
      await database.execute(`
        CREATE TABLE attendance (
          id TEXT PRIMARY KEY,
          batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
          student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          attendance_date TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
          notes TEXT NOT NULL DEFAULT '',
          marked_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (batch_id, student_id, attendance_date)
        )
      `);
      await database.execute(`
        CREATE TABLE internships (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'open'
            CHECK (status IN ('draft', 'open', 'closed', 'archived')),
          start_date TEXT,
          end_date TEXT,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          archived_at TEXT
        )
      `);
      await database.execute(`
        CREATE TABLE internship_applications (
          id TEXT PRIMARY KEY,
          internship_id TEXT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
          student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          supervisor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          status TEXT NOT NULL DEFAULT 'applied'
            CHECK (status IN ('applied', 'reviewing', 'accepted', 'rejected', 'in_progress', 'completed')),
          progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
          notes TEXT NOT NULL DEFAULT '',
          applied_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (internship_id, student_id)
        )
      `);
      await database.execute(`
        CREATE TABLE certificates (
          id TEXT PRIMARY KEY,
          certificate_id TEXT NOT NULL UNIQUE,
          student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          course_name TEXT NOT NULL,
          issued_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
          revoked_at TEXT,
          revoked_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL
        )
      `);

      for (const [name, description] of [
        ['students.archive', 'Archive students'],
        ['students.restore', 'Restore archived students'],
        ['students.delete', 'Permanently delete students'],
        ['batches.create', 'Create batches'],
        ['batches.update', 'Update batches'],
        ['batches.archive', 'Archive batches'],
        ['batches.delete', 'Delete batches'],
        ['batches.assign', 'Assign students and trainers to batches'],
        ['internships.read', 'Read internships and applications'],
        ['internships.create', 'Create internships'],
        ['internships.update', 'Update internships and applications'],
        ['internships.delete', 'Delete internships'],
        ['applications.read', 'Read internship applications'],
        ['applications.manage', 'Manage internship applications'],
        ['certificates.create', 'Issue certificates'],
        ['certificates.revoke', 'Revoke certificates'],
        ['certificates.delete', 'Delete certificates'],
      ] as const) {
        await database.execute(
          'INSERT INTO permissions (id, name, description) VALUES (?, ?, ?)',
          [`permission_${name.replaceAll('.', '_')}`, name, description],
        );
      }

      const grants: Record<string, string[]> = {
        SUPER_ADMIN: [
          'students.archive', 'students.restore', 'students.delete',
          'batches.create', 'batches.update', 'batches.archive', 'batches.delete', 'batches.assign',
          'internships.read', 'internships.create', 'internships.update', 'internships.delete',
          'applications.read', 'applications.manage',
          'certificates.create', 'certificates.revoke', 'certificates.delete',
        ],
        ADMIN: [
          'students.archive', 'students.restore',
          'batches.create', 'batches.update', 'batches.archive', 'batches.delete', 'batches.assign',
          'internships.read', 'internships.create', 'internships.update', 'internships.delete',
          'applications.read', 'applications.manage',
          'certificates.create', 'certificates.revoke', 'certificates.delete',
        ],
        TRAINER: [
          'internships.read', 'applications.read', 'applications.manage',
        ],
      };
      for (const [role, permissions] of Object.entries(grants)) {
        for (const permission of permissions) {
          await database.execute(
            `INSERT INTO role_permissions (role_id, permission_id)
             VALUES (?, ?)`,
            [`role_${role.toLowerCase()}`, `permission_${permission.replaceAll('.', '_')}`],
          );
        }
      }

      for (const [table, index] of [
        ['batch_students', 'batch_students_student_idx'],
        ['batch_trainers', 'batch_trainers_trainer_idx'],
        ['attendance', 'attendance_batch_date_idx'],
        ['internship_applications', 'internship_applications_student_idx'],
        ['certificates', 'certificates_student_issued_idx'],
      ] as const) {
        const columns: Record<string, string> = {
          batch_students: 'student_id',
          batch_trainers: 'trainer_id',
          attendance: 'batch_id, attendance_date',
          internship_applications: 'student_id',
          certificates: 'student_id, issued_at',
        };
        await database.execute(`CREATE INDEX ${index} ON ${table} (${columns[table]})`);
      }
    },
  },
  {
    id: '008_student_portal',
    async up(database) {
      await database.execute(`
        CREATE TABLE course_enrollments (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          course_record_id TEXT NOT NULL REFERENCES cms_records(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'active'
            CHECK (status IN ('active', 'completed', 'withdrawn')),
          enrolled_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE (student_id, course_record_id)
        )
      `);
      await database.execute(`
        CREATE TABLE student_announcements (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft'
            CHECK (status IN ('draft', 'published', 'archived')),
          created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          published_at TEXT
        )
      `);
      await database.execute('CREATE INDEX course_enrollments_student_idx ON course_enrollments (student_id, status, enrolled_at)');
      await database.execute('CREATE INDEX student_announcements_status_idx ON student_announcements (status, published_at)');

      for (const [name, description] of [
        ['enrollments.manage', 'Manage student course enrollments'],
        ['announcements.manage', 'Manage student announcements'],
      ] as const) {
        await database.execute(
          'INSERT INTO permissions (id, name, description) VALUES (?, ?, ?)',
          [`permission_${name.replaceAll('.', '_')}`, name, description],
        );
      }
      for (const role of ['SUPER_ADMIN', 'ADMIN']) {
        const permissions = role === 'ADMIN'
          ? ['enrollments.manage', 'announcements.manage', 'audit_logs.read']
          : ['enrollments.manage', 'announcements.manage'];
        for (const permission of permissions) {
          await database.execute(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [`role_${role.toLowerCase()}`, `permission_${permission.replaceAll('.', '_')}`],
          );
        }
      }
    },
  },
  {
    id: '009_student_profile_photo',
    async up(database) {
      await database.execute(
        "ALTER TABLE student_profiles ADD COLUMN photo TEXT NOT NULL DEFAULT ''",
      );
    },
  },
];

export async function runMigrations(database: DataDatabase): Promise<void> {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  for (const migration of migrations) {
    const existing = await database.query<{ id: string }>(
      'SELECT id FROM schema_migrations WHERE id = ?',
      [migration.id],
    );
    if (existing.rows.length) continue;

    await database.transaction(async () => {
      await migration.up(database);
      await database.execute(
        'INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)',
        [migration.id, new Date().toISOString()],
      );
    });
  }
}
