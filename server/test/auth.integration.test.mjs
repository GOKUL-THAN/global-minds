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
    APP_ALLOWED_ORIGINS: 'https://global-minds-git-main-website-1cc7.vercel.app',
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

test('allows configured Vercel origins and rejects unknown origins', async () => {
  const allowedResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://global-minds-git-main-website-1cc7.vercel.app',
    },
    body: JSON.stringify({}),
  });
  assert.equal(allowedResponse.status, 400);

  const blockedResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://untrusted.example',
    },
    body: JSON.stringify({}),
  });
  assert.equal(blockedResponse.status, 403);
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
  const trainerCookie = cookieFrom(trainerLogin);
  const trainerMe = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: trainerCookie } });
  assert.equal(trainerMe.status, 200);
  const authenticatedTrainerId = (await trainerMe.json()).user.id;
  const trainerAdminAccess = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { Cookie: trainerCookie },
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
  const adminMutationHeaders = {
    Cookie: adminCookie,
    Origin: 'http://localhost:5173',
    'Content-Type': 'application/json',
  };
  const superAdminMutationHeaders = {
    Cookie: superAdminCookie,
    Origin: 'http://localhost:5173',
    'Content-Type': 'application/json',
  };
  const forbiddenAdminCreation = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({
      email: 'elevated.admin@phase-two.test',
      fullName: 'Elevated Admin',
      password: 'ElevatedIntegrationPassword123!',
      role: 'ADMIN',
    }),
  });
  assert.equal(forbiddenAdminCreation.status, 403);
  const createdAdmin = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: superAdminMutationHeaders,
    body: JSON.stringify({
      email: 'created.admin@phase-two.test',
      fullName: 'Created Admin',
      password: 'CreatedIntegrationPassword123!',
      role: 'ADMIN',
    }),
  });
  assert.equal(createdAdmin.status, 201);
  const createdAdminId = (await createdAdmin.json()).data.user.id;
  const forbiddenAdminElevation = await fetch(`${baseUrl}/api/admin/users/${createdAdminId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ role: 'SUPER_ADMIN' }),
  });
  assert.equal(forbiddenAdminElevation.status, 403);
  const forbiddenRoleChange = await fetch(`${baseUrl}/api/admin/roles/ADMIN/permissions`, {
    method: 'PUT',
    headers: adminMutationHeaders,
    body: JSON.stringify({ permissions: ['users.read'] }),
  });
  assert.equal(forbiddenRoleChange.status, 403);
  const auditLogs = await fetch(`${baseUrl}/api/admin/audit-logs`, {
    headers: { Cookie: superAdminCookie },
  });
  assert.equal(auditLogs.status, 200);
  const adminSystemHealth = await fetch(`${baseUrl}/api/admin/system/health`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(adminSystemHealth.status, 403);
  const superAdminSystemHealth = await fetch(`${baseUrl}/api/admin/system/health`, {
    headers: { Cookie: superAdminCookie },
  });
  assert.equal(superAdminSystemHealth.status, 200);
  const healthResult = (await superAdminSystemHealth.json()).data;
  assert.equal(healthResult.database, 'connected');
  assert.ok(healthResult.migrationsApplied >= 8);
  const adminSummary = await fetch(`${baseUrl}/api/admin/operations/summary`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(adminSummary.status, 200);
  assert.ok(Number.isInteger((await adminSummary.json()).data.students));

  const statusResponse = await fetch(`${baseUrl}/api/admin/operations/status`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(statusResponse.status, 200);
  const moduleStatus = (await statusResponse.json()).data.modules;
  assert.deepEqual(Object.keys(moduleStatus).sort(), [
    'activity', 'attendance', 'batches', 'certificates', 'internships', 'students',
  ]);
  assert.ok(Object.values(moduleStatus).every(enabled => enabled === true));
  const adminAuditLogs = await fetch(`${baseUrl}/api/admin/audit-logs?pageSize=10`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(adminAuditLogs.status, 200);
  const studentStatusForbidden = await fetch(`${baseUrl}/api/admin/operations/status`, {
    headers: { Cookie: studentCookie },
  });
  assert.equal(studentStatusForbidden.status, 403);
  const studentCreateInvalid = await fetch(`${baseUrl}/api/admin/students`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ fullName: 'x', email: 'bad', password: 'ValidInitialPassword123!' }),
  });
  assert.equal(studentCreateInvalid.status, 400);
  const studentCreate = await fetch(`${baseUrl}/api/admin/students`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({
      fullName: 'Operations Test Student',
      email: 'operations.student@phase-two.test',
      password: 'ValidInitialPassword123!',
      phone: '12345678',
      country: 'Testland',
      city: 'Test City',
      education: 'BSc',
      experience: '1 year',
      interestedCourse: 'Cloud',
      learningMode: 'online',
      careerGoal: 'Cloud engineer',
      photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jHkAAAAASUVORK5CYII=',
    }),
  });
  assert.equal(studentCreate.status, 201);
  const operationalStudent = (await studentCreate.json()).data.student;
  assert.equal(operationalStudent.fullName, 'Operations Test Student');
  assert.equal(operationalStudent.photo.startsWith('data:image/png;base64,'), true);
  const studentId = operationalStudent.id;
  const forbiddenContentManagerElevation = await fetch(`${baseUrl}/api/admin/users/${studentId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ role: 'CONTENT_MANAGER' }),
  });
  assert.equal(forbiddenContentManagerElevation.status, 403);
  const deactivateStudent = await fetch(`${baseUrl}/api/admin/users/${studentId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ isActive: false }),
  });
  assert.equal(deactivateStudent.status, 200);
  const deactivatedStudentLogin = await login('operations.student@phase-two.test', 'ValidInitialPassword123!');
  assert.equal(deactivatedStudentLogin.status, 401);
  const reactivateStudent = await fetch(`${baseUrl}/api/admin/users/${studentId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ isActive: true }),
  });
  assert.equal(reactivateStudent.status, 200);
  const operationalStudentLogin = await login('operations.student@phase-two.test', 'ValidInitialPassword123!');
  assert.equal(operationalStudentLogin.status, 200);
  const operationalStudentCookie = cookieFrom(operationalStudentLogin);
  const studentDashboardUnauthenticated = await fetch(`${baseUrl}/api/student/dashboard`);
  assert.equal(studentDashboardUnauthenticated.status, 401);
  const studentDashboard = await fetch(`${baseUrl}/api/student/dashboard`, {
    headers: { Cookie: operationalStudentCookie },
  });
  assert.equal(studentDashboard.status, 200);
  assert.equal((await studentDashboard.json()).data.profile.id, studentId);
  const studentProfileUpdate = await fetch(`${baseUrl}/api/student/profile`, {
    method: 'PATCH',
    headers: {
      Cookie: operationalStudentCookie,
      Origin: 'http://localhost:5173',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ city: 'Student Updated City', email: 'attacker@phase-two.test' }),
  });
  assert.equal(studentProfileUpdate.status, 400);
  const validStudentProfileUpdate = await fetch(`${baseUrl}/api/student/profile`, {
    method: 'PATCH',
    headers: {
      Cookie: operationalStudentCookie,
      Origin: 'http://localhost:5173',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ city: 'Student Updated City', careerGoal: 'Build cloud applications' }),
  });
  assert.equal(validStudentProfileUpdate.status, 200);
  assert.equal((await validStudentProfileUpdate.json()).data.profile.city, 'Student Updated City');
  const studentProfileCrossAccess = await fetch(`${baseUrl}/api/admin/students/${studentId}`, {
    headers: { Cookie: operationalStudentCookie },
  });
  assert.equal(studentProfileCrossAccess.status, 403);
  const studentAdminCreate = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: {
      Cookie: operationalStudentCookie,
      Origin: 'http://localhost:5173',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'forbidden.admin@phase-two.test',
      fullName: 'Forbidden Admin',
      password: 'SafeIntegrationPassword123!',
      role: 'SUPER_ADMIN',
    }),
  });
  assert.equal(studentAdminCreate.status, 403);
  const searchedStudents = await fetch(`${baseUrl}/api/admin/students?search=operations%20test&page=1&pageSize=5`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await searchedStudents.json()).data.students[0].id, studentId);
  const studentDetail = await fetch(`${baseUrl}/api/admin/students/${studentId}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(studentDetail.status, 200);
  const studentUpdate = await fetch(`${baseUrl}/api/admin/students/${studentId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({
      city: 'Updated City',
      photo: 'data:image/webp;base64,UklGRg==',
    }),
  });
  assert.equal(studentUpdate.status, 200);
  const updatedStudent = (await studentUpdate.json()).data.student;
  assert.equal(updatedStudent.city, 'Updated City');
  assert.equal(updatedStudent.photo, 'data:image/webp;base64,UklGRg==');
  const archiveStudent = await fetch(`${baseUrl}/api/admin/students/${studentId}/archive`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(archiveStudent.status, 200);
  const restoreStudent = await fetch(`${baseUrl}/api/admin/students/${studentId}/restore`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(restoreStudent.status, 200);
  const deniedHardDelete = await fetch(`${baseUrl}/api/admin/students/${studentId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie, Origin: 'http://localhost:5173' },
  });
  assert.equal(deniedHardDelete.status, 403);

  const trainerListResponse = await fetch(`${baseUrl}/api/admin/users?role=TRAINER`, {
    headers: { Cookie: adminCookie },
  });
  const trainerList = (await trainerListResponse.json()).data.users;
  const trainerId = trainerList.find(user => user.email === 'trainer@phase-two.test').id;
  const batchCreate = await fetch(`${baseUrl}/api/admin/batches`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({
      name: 'Operations Batch',
      code: 'OPS-2026',
      description: 'Operational API integration batch',
      startDate: '2026-10-01',
      endDate: '2026-12-01',
      schedule: { days: ['Monday', 'Wednesday'], time: '10:00' },
      status: 'active',
    }),
  });
  assert.equal(batchCreate.status, 201);
  const batch = (await batchCreate.json()).data.batch;
  const batchId = batch.id;
  assert.equal(batch.schedule.time, '10:00');
  const searchedBatches = await fetch(`${baseUrl}/api/admin/batches?search=OPS-2026&status=active`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await searchedBatches.json()).data.batches[0].id, batchId);
  assert.equal((await fetch(`${baseUrl}/api/admin/batches?page=1&pageSize=10`, {
    headers: { Cookie: adminCookie },
  }).then(response => response.json())).data.batches.some(item => item.id === batchId), true);
  const studentAssignment = await fetch(`${baseUrl}/api/admin/batches/${batchId}/students`, {
    method: 'PUT',
    headers: adminMutationHeaders,
    body: JSON.stringify({ studentIds: [studentId] }),
  });
  assert.equal(studentAssignment.status, 200);
  const trainerAssignment = await fetch(`${baseUrl}/api/admin/batches/${batchId}/trainers`, {
    method: 'PUT',
    headers: adminMutationHeaders,
    body: JSON.stringify({ trainerIds: [trainerId] }),
  });
  assert.equal(trainerAssignment.status, 200);
  assert.deepEqual((await trainerAssignment.json()).data.batch.trainerIds, [trainerId]);
  const studentDashboardWithBatch = await fetch(`${baseUrl}/api/student/dashboard`, {
    headers: { Cookie: operationalStudentCookie },
  });
  assert.deepEqual((await studentDashboardWithBatch.json()).data.batches.map(item => item.id), [batchId]);
  assert.equal(authenticatedTrainerId, trainerId);
  const trainerStudents = await fetch(`${baseUrl}/api/admin/students`, {
    headers: { Cookie: trainerCookie },
  });
  const trainerStudentsBody = await trainerStudents.json();
  assert.ok(trainerStudentsBody.data.students.some(student => student.id === studentId), JSON.stringify(trainerStudentsBody));
  const trainerBatches = await fetch(`${baseUrl}/api/admin/batches`, {
    headers: { Cookie: trainerCookie },
  });
  assert.ok((await trainerBatches.json()).data.batches.some(item => item.id === batchId));

  const unassignedBatchCreate = await fetch(`${baseUrl}/api/admin/batches`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ name: 'Unassigned Trainer Batch', code: 'NO-TRAINER', status: 'active' }),
  });
  assert.equal(unassignedBatchCreate.status, 201);
  const unassignedBatchId = (await unassignedBatchCreate.json()).data.batch.id;
  await fetch(`${baseUrl}/api/admin/batches/${unassignedBatchId}/students`, {
    method: 'PUT',
    headers: adminMutationHeaders,
    body: JSON.stringify({ studentIds: [studentId] }),
  });
  const scopedBatches = await fetch(`${baseUrl}/api/admin/batches`, {
    headers: { Cookie: trainerCookie },
  });
  assert.equal((await scopedBatches.json()).data.batches.some(item => item.id === unassignedBatchId), false);
  const forbiddenBatchDetail = await fetch(`${baseUrl}/api/admin/batches/${unassignedBatchId}`, {
    headers: { Cookie: trainerCookie },
  });
  assert.equal(forbiddenBatchDetail.status, 404);
  const forbiddenAttendance = await fetch(`${baseUrl}/api/admin/attendance`, {
    method: 'PUT',
    headers: { Cookie: trainerCookie, Origin: 'http://localhost:5173', 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchId: unassignedBatchId, studentId, attendanceDate: '2026-10-10', status: 'present' }),
  });
  assert.equal(forbiddenAttendance.status, 400);

  const attendanceUpsert = await fetch(`${baseUrl}/api/admin/attendance`, {
    method: 'PUT',
    headers: adminMutationHeaders,
    body: JSON.stringify({ batchId, studentId, attendanceDate: '2026-10-10', status: 'present', notes: 'On time' }),
  });
  assert.equal(attendanceUpsert.status, 201);
  const attendanceRecord = (await attendanceUpsert.json()).data.attendance;
  assert.equal(attendanceRecord.status, 'present');
  const studentDashboardWithAttendance = await fetch(`${baseUrl}/api/student/dashboard`, {
    headers: { Cookie: operationalStudentCookie },
  });
  assert.equal((await studentDashboardWithAttendance.json()).data.attendance[0].id, attendanceRecord.id);
  const trainerAttendance = await fetch(`${baseUrl}/api/admin/attendance?batchId=${batchId}`, {
    headers: { Cookie: trainerCookie },
  });
  assert.ok((await trainerAttendance.json()).data.attendance.some(record => record.id === attendanceRecord.id));
  const attendanceUpdate = await fetch(`${baseUrl}/api/admin/attendance/${attendanceRecord.id}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ status: 'late' }),
  });
  assert.equal(attendanceUpdate.status, 200);
  assert.equal((await attendanceUpdate.json()).data.attendance.status, 'late');
  const attendanceList = await fetch(`${baseUrl}/api/admin/attendance?date=2026-10-10&search=operations%20test`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await attendanceList.json()).data.attendance[0].id, attendanceRecord.id);
  const attendanceReport = await fetch(`${baseUrl}/api/admin/attendance/report?batchId=${batchId}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(attendanceReport.status, 200);
  assert.equal((await attendanceReport.json()).data.report.length, 1);

  const internshipCreate = await fetch(`${baseUrl}/api/admin/internships`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ title: 'Operations Internship', company: 'Example Co', description: 'Test internship', status: 'open' }),
  });
  assert.equal(internshipCreate.status, 201);
  const internship = (await internshipCreate.json()).data.internship;
  const internshipId = internship.id;
  const searchedInternships = await fetch(`${baseUrl}/api/admin/internships?search=example%20co&status=open`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await searchedInternships.json()).data.internships[0].id, internshipId);
  const internshipDetail = await fetch(`${baseUrl}/api/admin/internships/${internshipId}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await internshipDetail.json()).data.internship.id, internshipId);
  const applicationCreate = await fetch(`${baseUrl}/api/admin/internships/${internshipId}/applications`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ studentId }),
  });
  assert.equal(applicationCreate.status, 201);
  const application = (await applicationCreate.json()).data.application;
  const applicationUpdate = await fetch(`${baseUrl}/api/admin/internships/applications/${application.id}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ supervisorId: trainerId, progress: 25, status: 'in_progress' }),
  });
  assert.equal(applicationUpdate.status, 200);
  assert.equal((await applicationUpdate.json()).data.application.progress, 25);
  const applicationsList = await fetch(`${baseUrl}/api/admin/internships/applications?internshipId=${internshipId}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await applicationsList.json()).data.applications.length, 1);

  const certificateCreate = await fetch(`${baseUrl}/api/admin/certificates`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ studentId, courseName: 'Cloud Fundamentals', certificateId: 'OPS-CERT-001' }),
  });
  assert.equal(certificateCreate.status, 201);
  const certificate = (await certificateCreate.json()).data.certificate;
  const certificateList = await fetch(`${baseUrl}/api/admin/certificates?studentId=${studentId}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await certificateList.json()).data.certificates.length, 1);
  const searchedCertificates = await fetch(`${baseUrl}/api/admin/certificates?search=OPS-CERT-001`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal((await searchedCertificates.json()).data.certificates[0].id, certificate.id);
  const certificateVerify = await fetch(`${baseUrl}/api/certificates/verify/${certificate.certificateId}`);
  assert.equal(certificateVerify.status, 200);
  assert.equal((await certificateVerify.json()).data.valid, true);
  const enrollmentCreate = await fetch(`${baseUrl}/api/admin/students/${studentId}/enrollments`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ courseSlug: 'aws-training' }),
  });
  assert.equal(enrollmentCreate.status, 201);
  const studentAnnouncement = await fetch(`${baseUrl}/api/admin/announcements`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ title: 'Term update', body: 'Your next term schedule is ready.', status: 'published' }),
  });
  assert.equal(studentAnnouncement.status, 201);
  const completeStudentDashboardResponse = await fetch(`${baseUrl}/api/student/dashboard`, {
    headers: { Cookie: operationalStudentCookie },
  });
  assert.equal(completeStudentDashboardResponse.status, 200);
  const completeStudentDashboard = (await completeStudentDashboardResponse.json()).data;
  assert.equal(completeStudentDashboard.courses.some(course => course.slug === 'aws-training'), true);
  assert.equal(completeStudentDashboard.batches.some(item => item.id === batchId), true);
  assert.equal(completeStudentDashboard.attendance.some(item => item.id === attendanceRecord.id), true);
  assert.equal(completeStudentDashboard.internships.some(item => item.id === application.id), true);
  assert.equal(completeStudentDashboard.certificates.some(item => item.id === certificate.id), true);
  assert.equal(completeStudentDashboard.announcements.some(item => item.title === 'Term update'), true);
  assert.equal(completeStudentDashboard.activity.some(item => item.action === 'student.updated'), true);
  const studentEnrollmentsForbidden = await fetch(`${baseUrl}/api/admin/students/${studentId}/enrollments`, {
    headers: { Cookie: operationalStudentCookie },
  });
  assert.equal(studentEnrollmentsForbidden.status, 403);
  const certificateRevoke = await fetch(`${baseUrl}/api/admin/certificates/${certificate.id}/revoke`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(certificateRevoke.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/certificates/verify/${certificate.certificateId}`).then(response => response.json())).data.valid, false);
  const certificateDelete = await fetch(`${baseUrl}/api/admin/certificates/${certificate.id}`, {
    method: 'DELETE',
    headers: adminMutationHeaders,
  });
  assert.equal(certificateDelete.status, 200);
  const persistedCertificateCreate = await fetch(`${baseUrl}/api/admin/certificates`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({ studentId, courseName: 'Persistent Certificate', certificateId: 'OPS-CERT-PERSIST' }),
  });
  assert.equal(persistedCertificateCreate.status, 201);
  const persistedCertificate = (await persistedCertificateCreate.json()).data.certificate;

  const filteredActivity = await fetch(`${baseUrl}/api/admin/audit-logs?resourceType=student&resourceId=${studentId}`, {
    headers: { Cookie: superAdminCookie },
  });
  assert.equal(filteredActivity.status, 200);
  const activityBody = (await filteredActivity.json()).data;
  assert.ok(activityBody.auditLogs.some(entry => entry.action === 'student.created'));
  const auditDelete = await fetch(`${baseUrl}/api/admin/audit-logs/${activityBody.auditLogs[0].id}`, {
    method: 'DELETE',
    headers: { Cookie: superAdminCookie, Origin: 'http://localhost:5173' },
  });
  assert.equal(auditDelete.status, 404);
  const auditUpdate = await fetch(`${baseUrl}/api/admin/audit-logs/${activityBody.auditLogs[0].id}`, {
    method: 'PATCH',
    headers: superAdminMutationHeaders,
    body: JSON.stringify({ action: 'tampered' }),
  });
  assert.equal(auditUpdate.status, 404);
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
  const archivedCatalog = await fetch(`${baseUrl}/api/content/courses`);
  assert.equal(archivedCatalog.status, 200);
  const archivedPublicRecord = (await archivedCatalog.json()).records.find(record => record.slug === courseSlug);
  assert.equal(archivedPublicRecord.status, 'archived');
  assert.equal('content' in archivedPublicRecord, false);

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
  const unpublishedCatalog = await fetch(`${baseUrl}/api/content/courses`);
  assert.equal(unpublishedCatalog.status, 200);
  const unpublishedPublicRecord = (await unpublishedCatalog.json()).records.find(record => record.slug === courseSlug);
  assert.equal(unpublishedPublicRecord.id, unpublishedRecord.id);
  assert.equal(unpublishedPublicRecord.section, 'courses');
  assert.equal(unpublishedPublicRecord.slug, courseSlug);
  assert.equal(unpublishedPublicRecord.status, 'unpublished');
  assert.equal(unpublishedPublicRecord.updatedAt, unpublishedRecord.updatedAt);
  assert.equal(unpublishedPublicRecord.publishedAt, unpublishedRecord.publishedAt);
  assert.equal('content' in unpublishedPublicRecord, false);

  const scholarshipSlug = 'admin-delete-scholarship';
  const createScholarship = await fetch(`${baseUrl}/api/admin/content/scholarships`, {
    method: 'POST',
    headers: adminMutationHeaders,
    body: JSON.stringify({
      slug: scholarshipSlug,
      content: { title: 'Scholarship to remove', description: 'Temporary CMS record.' },
    }),
  });
  assert.equal(createScholarship.status, 201);
  const studentDeleteScholarship = await fetch(`${baseUrl}/api/admin/content/scholarships/${scholarshipSlug}`, {
    method: 'DELETE',
    headers: { Cookie: operationalStudentCookie, Origin: 'http://localhost:5173' },
  });
  assert.equal(studentDeleteScholarship.status, 403);
  const deleteScholarship = await fetch(`${baseUrl}/api/admin/content/scholarships/${scholarshipSlug}`, {
    method: 'DELETE',
    headers: adminMutationHeaders,
  });
  assert.equal(deleteScholarship.status, 204);
  const deletedScholarship = await fetch(`${baseUrl}/api/admin/content/scholarships/${scholarshipSlug}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(deletedScholarship.status, 404);

  await stopApi();
  await startApi();
  const afterRestart = await fetch(`${baseUrl}/api/admin/content/courses/${courseSlug}`, {
    headers: { Cookie: adminCookie },
  });
  assert.equal(afterRestart.status, 200);
  assert.equal((await afterRestart.json()).record.content.title, updatedContent.title);
  const persistedBatches = await fetch(`${baseUrl}/api/admin/batches`, {
    headers: { Cookie: adminCookie },
  });
  assert.ok((await persistedBatches.json()).data.batches.some(batch => batch.id === batchId));
  const persistedInternships = await fetch(`${baseUrl}/api/admin/internships`, {
    headers: { Cookie: adminCookie },
  });
  assert.ok((await persistedInternships.json()).data.internships.some(internship => internship.id === internshipId));
  const persistedAttendance = await fetch(`${baseUrl}/api/admin/attendance?batchId=${batchId}`, {
    headers: { Cookie: adminCookie },
  });
  const persistedAttendanceBody = await persistedAttendance.json();
  assert.ok(persistedAttendanceBody.data.attendance.some(record => record.id === attendanceRecord.id), JSON.stringify(persistedAttendanceBody));
  const persistedApplications = await fetch(`${baseUrl}/api/admin/internships/applications?internshipId=${internshipId}`, {
    headers: { Cookie: adminCookie },
  });
  assert.ok((await persistedApplications.json()).data.applications.some(record => record.id === application.id));
  const persistedCertificates = await fetch(`${baseUrl}/api/admin/certificates?search=OPS-CERT-PERSIST`, {
    headers: { Cookie: adminCookie },
  });
  assert.ok((await persistedCertificates.json()).data.certificates.some(record => record.id === persistedCertificate.id));
  assert.equal((await fetch(`${baseUrl}/api/certificates/verify/OPS-CERT-PERSIST`).then(response => response.json())).data.valid, true);
  const studentDelete = await fetch(`${baseUrl}/api/admin/students/${studentId}`, {
    method: 'DELETE',
    headers: superAdminMutationHeaders,
  });
  assert.equal(studentDelete.status, 200);
  const retainedActivity = await fetch(`${baseUrl}/api/admin/audit-logs?resourceType=student&resourceId=${studentId}`, {
    headers: { Cookie: superAdminCookie },
  });
  assert.ok((await retainedActivity.json()).data.auditLogs.some(entry => entry.action === 'student.deleted'));
  const updatePersistedBatch = await fetch(`${baseUrl}/api/admin/batches/${batchId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ status: 'completed' }),
  });
  assert.equal(updatePersistedBatch.status, 200);
  const archivePersistedBatch = await fetch(`${baseUrl}/api/admin/batches/${batchId}/archive`, {
    method: 'POST',
    headers: adminMutationHeaders,
  });
  assert.equal(archivePersistedBatch.status, 200);
  const deletePersistedBatch = await fetch(`${baseUrl}/api/admin/batches/${batchId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie, Origin: 'http://localhost:5173' },
  });
  assert.equal(deletePersistedBatch.status, 200);
  const updatePersistedInternship = await fetch(`${baseUrl}/api/admin/internships/${internshipId}`, {
    method: 'PATCH',
    headers: adminMutationHeaders,
    body: JSON.stringify({ status: 'closed' }),
  });
  assert.equal(updatePersistedInternship.status, 200);
  const deletePersistedInternship = await fetch(`${baseUrl}/api/admin/internships/${internshipId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie, Origin: 'http://localhost:5173' },
  });
  assert.equal(deletePersistedInternship.status, 200);

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
    'cms.record.deleted',
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
