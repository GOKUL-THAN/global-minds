import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import {
  archiveCmsRecord,
  cmsSections,
  closeDataDatabase,
  createCmsRecord,
  createStudentAccount,
  createEmailVerificationToken,
  createPasswordResetToken,
  deleteCmsRecord,
  emailIsRegistered,
  findIdentityByEmail,
  findIdentityPasswordHash,
  getCourseStructure,
  findCmsRecord,
  initializeDatabase,
  listIdentitySessions,
  listAuditLogs,
  getOperationsStatus,
  insertAuditLog,
  listManagedIdentities,
  listIdentityPermissionNames,
  listIdentityRoles,
  recordAuthenticationFailure,
  resetIdentityPassword,
  revokeAllIdentitySessions,
  revokeIdentitySession,
  updateIdentityLastLogin,
  updateManagedIdentity,
  replaceIdentityRolePermissions,
  changeIdentityPassword,
  verifyIdentityEmail,
  listCmsRecords,
  listEnquiries,
  listIdentityPermissions,
  listPublishedCmsRecords,
  publishCmsRecord,
  restoreCmsRecord,
  createEnquiry,
  subscribeNewsletter,
  updateEnquiry,
  updateCmsRecord,
  unpublishCmsRecord,
  type CmsSection,
  type CmsStatus,
} from './db.js';
import { getDataDatabase } from './database.js';
import {
  authenticate,
  createOneTimeSecret,
  createSessionToken,
  currentIpAddress,
  hashSecret,
  requirePermission,
  sessionCookieName,
  sessionCookieOptions,
} from './auth.js';
import { EmailDeliveryConfigurationError, sendAccountEmail } from './email.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '128kb' }));
app.use(cookieParser());

const allowedOrigins = new Set([
  config.appOrigin,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].map(origin => origin.replace(/\/$/, '')));

const requireSameOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get('origin')?.replace(/\/$/, '');
  if (!origin || !allowedOrigins.has(origin)) {
    res.status(403).json({ message: 'Request origin is not allowed.' });
    return;
  }
  next();
};

const requireSameOriginForMutations: RequestHandler = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  requireSameOrigin(req, res, next);
};

const asyncHandler = (handler: RequestHandler): RequestHandler =>
  (req, res, next) => { void Promise.resolve(handler(req, res, next)).catch(next); };

const cmsStatuses: CmsStatus[] = ['draft', 'published', 'archived'];
const isCmsSection = (section: string): section is CmsSection =>
  (cmsSections as readonly string[]).includes(section);
const publicCmsSections = new Set<CmsSection>([
  'courses',
  'categories',
  'master-programs',
  'website-menu',
  'live-projects',
  'events',
  'scholarships',
  'refer-earn',
  'corporate-training',
  'about',
  'contact',
  'online-training',
  'classroom-training',
  'certifications',
  'demo-class',
  'skill-assessment',
  'career',
  'placement-records',
  'interview-preparation',
  'mock-interview',
  'instructors',
  'internships',
  'locations',
  'blog',
  'faqs',
  'testimonials',
]);
const isPublicCmsSection = (section: string): section is CmsSection =>
  isCmsSection(section) && publicCmsSections.has(section);
const validSlug = (slug: string): boolean => /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug) && slug.length <= 120;
const routeParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? '' : value ?? '';
const readCmsContent = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return undefined;
  }
  if (Buffer.byteLength(serialized) > 64 * 1024) return undefined;
  return value as Record<string, unknown>;
};
const contentValidationMessage = 'Content must be a JSON object no larger than 64 KB.';
const courseContentValidationMessage = 'Course details are invalid. Check the title, category, prices, URLs, list fields, and module/lesson structure.';
const safeContentUrl = (value: unknown): boolean => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  if (!value || (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'))) return true;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:')
      && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
};

function validateCourseContent(value: unknown): Record<string, unknown> | undefined {
  const content = readCmsContent(value);
  if (!content || typeof content.title !== 'string'
    || content.title.trim().length < 2 || content.title.trim().length > 160) return undefined;
  const stringFields: Record<string, number> = {
    shortDescription: 500,
    longDescription: 20_000,
    description: 20_000,
    category: 120,
    subCategory: 120,
    level: 40,
    duration: 120,
    language: 80,
  };
  for (const [field, maximum] of Object.entries(stringFields)) {
    if (content[field] !== undefined
      && (typeof content[field] !== 'string' || content[field].length > maximum)) return undefined;
  }
  for (const field of ['thumbnail', 'banner', 'video']) {
    if (content[field] !== undefined && !safeContentUrl(content[field])) return undefined;
  }
  for (const field of ['tags', 'prerequisites', 'learningObjectives', 'syllabus']) {
    if (content[field] !== undefined
      && (!Array.isArray(content[field]) || content[field].length > 100
        || content[field].some(item => typeof item !== 'string' || item.length > 500))) return undefined;
  }
  if (content.category !== undefined
    && (typeof content.category !== 'string' || !validSlug(content.category))) return undefined;
  if (content.level !== undefined && !['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(String(content.level))) {
    return undefined;
  }
  for (const field of ['price', 'discountPrice']) {
    if (content[field] !== undefined
      && (typeof content[field] !== 'number' || !Number.isFinite(content[field]) || content[field] < 0)) return undefined;
  }
  if (typeof content.price === 'number' && typeof content.discountPrice === 'number'
    && content.discountPrice > content.price) return undefined;
  if (content.currency !== undefined
    && !['INR', 'USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD'].includes(String(content.currency))) return undefined;
  if (content.modules === undefined) return content;
  if (!Array.isArray(content.modules) || content.modules.length > 100) return undefined;
  const modulePositions = new Set<number>();
  const moduleIds = new Set<string>();
  const modules: Record<string, unknown>[] = [];
  for (const [index, valueModule] of content.modules.entries()) {
    if (!valueModule || typeof valueModule !== 'object' || Array.isArray(valueModule)) return undefined;
    const module = valueModule as Record<string, unknown>;
    if (typeof module.title !== 'string' || module.title.trim().length < 1
      || module.title.trim().length > 160
      || (module.id !== undefined && (typeof module.id !== 'string' || module.id.length > 120))
      || (module.duration !== undefined && (typeof module.duration !== 'string' || module.duration.length > 120))
      || (module.description !== undefined && (typeof module.description !== 'string' || module.description.length > 2000))) return undefined;
    if (typeof module.id === 'string' && module.id.trim()) {
      if (moduleIds.has(module.id.trim())) return undefined;
      moduleIds.add(module.id.trim());
    }
    const position = module.position === undefined ? index : module.position;
    if (!Number.isInteger(position) || (position as number) < 0 || modulePositions.has(position as number)) return undefined;
    modulePositions.add(position as number);

    const lessons = Array.isArray(module.lessons)
      ? module.lessons
      : Array.isArray(module.topics) ? module.topics : [];
    if (lessons.length > 200) return undefined;
    const lessonPositions = new Set<number>();
    const lessonIds = new Set<string>();
    const normalizedLessons: Array<string | Record<string, unknown>> = [];
    for (const [lessonIndex, valueLesson] of lessons.entries()) {
      if (typeof valueLesson === 'string') {
        if (!valueLesson.trim() || valueLesson.length > 200) return undefined;
        normalizedLessons.push(valueLesson);
        continue;
      }
      if (!valueLesson || typeof valueLesson !== 'object' || Array.isArray(valueLesson)) return undefined;
      const lesson = valueLesson as Record<string, unknown>;
      if (typeof lesson.title !== 'string' || !lesson.title.trim() || lesson.title.length > 200
        || (lesson.id !== undefined && (typeof lesson.id !== 'string' || lesson.id.length > 120))
        || (lesson.summary !== undefined && (typeof lesson.summary !== 'string' || lesson.summary.length > 2000))
        || (lesson.content !== undefined && (!lesson.content || typeof lesson.content !== 'object' || Array.isArray(lesson.content)))
        || (lesson.durationMinutes !== undefined && (!Number.isInteger(lesson.durationMinutes) || (lesson.durationMinutes as number) < 0 || (lesson.durationMinutes as number) > 1440))
        || (lesson.isPreview !== undefined && typeof lesson.isPreview !== 'boolean')
        || (lesson.status !== undefined && !['draft', 'published', 'archived'].includes(String(lesson.status)))
        || !['videoUrl', 'documentUrl', 'externalUrl'].every(field => lesson[field] === undefined || safeContentUrl(lesson[field]))) return undefined;
      if (typeof lesson.id === 'string' && lesson.id.trim()) {
        if (lessonIds.has(lesson.id.trim())) return undefined;
        lessonIds.add(lesson.id.trim());
      }
      const lessonPosition = lesson.position === undefined ? lessonIndex : lesson.position;
      if (!Number.isInteger(lessonPosition) || (lessonPosition as number) < 0
        || lessonPositions.has(lessonPosition as number)) return undefined;
      lessonPositions.add(lessonPosition as number);
      normalizedLessons.push(lesson);
    }
    modules.push({ ...module, position, lessons: normalizedLessons });
  }
  modules.sort((first, second) => (first.position as number) - (second.position as number));
  return { ...content, modules };
}

function coursePublicationError(content: Record<string, unknown>): string | undefined {
  if (typeof content.category !== 'string' || !validSlug(content.category)) {
    return 'A valid category slug is required before publishing.';
  }
  if (!['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(String(content.level))) {
    return 'Select a valid difficulty level before publishing.';
  }
  if (typeof content.shortDescription !== 'string' || !content.shortDescription.trim()
    || typeof content.longDescription !== 'string' || !content.longDescription.trim()) {
    return 'A short and full course description are required before publishing.';
  }
  if (typeof content.duration !== 'string' || !content.duration.trim()) {
    return 'Course duration is required before publishing.';
  }
  if (typeof content.thumbnail !== 'string' || !content.thumbnail.trim() || !safeContentUrl(content.thumbnail)) {
    return 'A valid course thumbnail URL is required before publishing.';
  }
  if (typeof content.price !== 'number' || !Number.isFinite(content.price) || content.price < 0
    || typeof content.discountPrice !== 'number' || !Number.isFinite(content.discountPrice)
    || content.discountPrice < 0 || content.discountPrice > content.price
    || !['INR', 'USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD'].includes(String(content.currency))) {
    return 'Course prices and currency are invalid.';
  }
  if (!Array.isArray(content.modules) || content.modules.length === 0
    || !content.modules.some(module => module && typeof module === 'object'
      && !Array.isArray(module)
      && ((Array.isArray((module as Record<string, unknown>).lessons)
        && ((module as Record<string, unknown>).lessons as unknown[]).length > 0)
        || (Array.isArray((module as Record<string, unknown>).topics)
          && ((module as Record<string, unknown>).topics as unknown[]).length > 0)))) {
    return 'Add at least one module with one lesson before publishing.';
  }
}

function slugFromTitle(value: unknown): string {
  return typeof value === 'string'
    ? value.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
    : '';
}

function requireCmsPermission(action: 'read' | 'create' | 'update' | 'publish' | 'archive' | 'delete'): RequestHandler {
  return (req, res, next) => {
    const section = routeParam(req.params.section);
    const permission = section === 'courses' ? `courses.${action}` : `content.${action}`;
    requirePermission(permission)(req, res, next);
  };
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(['/api/auth', '/api/admin'], (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again in 15 minutes.' },
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Please try again later.' },
});

const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many enquiries submitted. Please try again later.' },
});

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many newsletter requests. Please try again later.' },
});

const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many account recovery requests. Try again later.' } },
});

const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many verification requests. Try again later.' } },
});

const validEmail = (email: string): boolean =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validPassword = (password: string): boolean =>
  Buffer.byteLength(password) >= 12 && Buffer.byteLength(password) <= 72;
const verificationLink = (token: string): string =>
  `${config.appOrigin}/verify-email?token=${encodeURIComponent(token)}`;
const passwordResetLink = (token: string): string =>
  `${config.appOrigin}/reset-password?token=${encodeURIComponent(token)}`;
const respondEmailConfigurationError = (res: express.Response): void => {
  res.status(503).json({
    success: false,
    error: {
      code: 'EMAIL_DELIVERY_NOT_CONFIGURED',
      message: 'Account email delivery is unavailable. Configure RESEND_API_KEY and EMAIL_FROM before using this feature.',
    },
  });
};
const respondEmailDeliveryError = (res: express.Response): void => {
  res.status(502).json({
    success: false,
    error: {
      code: 'EMAIL_DELIVERY_FAILED',
      message: 'The account email could not be delivered. Please retry later.',
    },
  });
};

app.post('/api/enquiries', requireSameOrigin, enquiryLimiter, asyncHandler(async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const course = typeof body.course === 'string' ? body.course.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim() : 'Website Form';

  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || phone.length < 7 || phone.length > 32 || course.length > 200
    || message.length > 5000 || source.length > 100) {
    res.status(400).json({ message: 'Please provide valid enquiry details.' });
    return;
  }

  const enquiry = await createEnquiry({ name, email, phone, course, message, source });
  res.status(201).json({ success: true, enquiry });
}));

app.post('/api/newsletter', requireSameOrigin, newsletterLimiter, asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    return;
  }
  const created = await subscribeNewsletter(email);
  res.status(created ? 201 : 200).json({
    success: true,
    message: created ? 'Newsletter subscription saved.' : 'This email is already subscribed.',
  });
}));

app.post('/api/auth/register', requireSameOrigin, registrationLimiter, asyncHandler(async (req, res) => {
  if (!config.emailConfigured) {
    respondEmailConfigurationError(res);
    return;
  }
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : {};
  const stringField = (key: string): string =>
    typeof body[key] === 'string' ? (body[key] as string).trim() : '';
  const fullName = stringField('fullName');
  const email = stringField('email').toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const phone = stringField('phone');
  const country = stringField('country');
  const city = stringField('city');
  const education = stringField('education');
  const experience = stringField('experience');
  const interestedCourse = stringField('interestedCourse');
  const mode = stringField('mode');
  const careerGoal = stringField('careerGoal');

  if (fullName.length < 2 || fullName.length > 120
    || !validEmail(email) || !validPassword(password)
    || phone.length < 7 || phone.length > 32
    || country.length < 2 || country.length > 100
    || city.length > 100 || education.length > 120 || experience.length > 120
    || interestedCourse.length > 200 || mode.length > 60 || careerGoal.length > 500
    || body.consent !== true) {
    res.status(400).json({ success: false, message: 'Please provide valid registration details and accept the terms.' });
    return;
  }

  if (await emailIsRegistered(email)) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let userId: string;
  try {
    userId = await createStudentAccount({
      email, fullName, passwordHash, phone, country, city, education,
      experience, interestedCourse, mode, careerGoal,
    });
  } catch (error) {
    const databaseErrorCode = error && typeof error === 'object' && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined;
    if (databaseErrorCode === '23505'
      || (error instanceof Error && error.message.includes('UNIQUE constraint failed'))) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }
    throw error;
  }

  const token = createOneTimeSecret();
  await createEmailVerificationToken(
    userId,
    hashSecret(token),
    new Date(Date.now() + config.verificationTokenTtlMinutes * 60_000).toISOString(),
  );
  try {
    await sendAccountEmail(
      email,
      'Verify your Global Minds Academy account',
      `Verify your email within ${config.verificationTokenTtlMinutes} minutes:\n\n${verificationLink(token)}\n\nIf you did not create this account, you can ignore this message.`,
    );
  } catch (error) {
    if (error instanceof EmailDeliveryConfigurationError) {
      respondEmailConfigurationError(res);
      return;
    }
    console.error('[auth] Registration verification email failed:', error);
    respondEmailDeliveryError(res);
    return;
  }

  res.status(201).json({
    success: true,
    verificationRequired: true,
    message: 'Your account was created. Check your email for a verification link before signing in.',
  });
}));

app.post('/api/auth/login', requireSameOrigin, loginLimiter, asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!validEmail(email) || !password || Buffer.byteLength(password) > 72) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid email and password are required.' } });
    return;
  }

  const account = await findIdentityByEmail(email);
  if (!account || account.is_active !== 1 || !(await bcrypt.compare(password, account.password_hash))) {
    await recordAuthenticationFailure(email, currentIpAddress(req));
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    return;
  }

  if (account.role === 'STUDENT' && account.email_verified !== 1) {
    await recordAuthenticationFailure(email, currentIpAddress(req));
    res.status(403).json({
      success: false,
      code: 'EMAIL_VERIFICATION_REQUIRED',
      message: 'Email verification is required before you can sign in.',
    });
    return;
  }

  await updateIdentityLastLogin(account.id, currentIpAddress(req));
  const session = await createSessionToken(
    account.id,
    req.get('user-agent') ?? '',
    currentIpAddress(req),
  );
  res.cookie(sessionCookieName, session.token, sessionCookieOptions);
  res.json({
    success: true,
    user: {
      id: account.id,
      email: account.email,
      role: account.role,
      fullName: `${account.first_name} ${account.last_name}`.trim(),
      phone: account.phone,
      country: account.country,
      city: account.city,
      education: account.education,
      experience: account.experience,
      createdAt: account.created_at,
      isActive: true,
      emailVerified: account.email_verified === 1,
      permissions: await listIdentityPermissions(account.role),
    },
  });
}));

app.post('/api/auth/verify-email', requireSameOrigin, verificationLimiter, asyncHandler(async (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  if (token.length < 40 || token.length > 100) {
    res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Verification link is invalid or expired.' } });
    return;
  }
  const verified = await verifyIdentityEmail(hashSecret(token), currentIpAddress(req));
  if (!verified) {
    res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Verification link is invalid or expired.' } });
    return;
  }
  res.json({ success: true, data: { message: 'Email verified. You can now sign in.' } });
}));

app.post('/api/auth/resend-verification', requireSameOrigin, verificationLimiter, asyncHandler(async (req, res) => {
  if (!config.emailConfigured) {
    respondEmailConfigurationError(res);
    return;
  }
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!validEmail(email)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid email address.' } });
    return;
  }
  const account = await findIdentityByEmail(email);
  if (!account || account.role !== 'STUDENT' || account.email_verified === 1 || account.is_active !== 1) {
    res.status(202).json({ success: true, data: { message: 'If the account requires verification, a new link will be sent.' } });
    return;
  }
  const token = createOneTimeSecret();
  await createEmailVerificationToken(
    account.id,
    hashSecret(token),
    new Date(Date.now() + config.verificationTokenTtlMinutes * 60_000).toISOString(),
  );
  try {
    await sendAccountEmail(
      email,
      'Verify your Global Minds Academy account',
      `Verify your email within ${config.verificationTokenTtlMinutes} minutes:\n\n${verificationLink(token)}`,
    );
  } catch (error) {
    if (error instanceof EmailDeliveryConfigurationError) {
      respondEmailConfigurationError(res);
      return;
    }
    console.error('[auth] Verification resend failed:', error);
    respondEmailDeliveryError(res);
    return;
  }
  res.status(202).json({ success: true, data: { message: 'If the account requires verification, a new link will be sent.' } });
}));

app.post('/api/auth/forgot-password', requireSameOrigin, recoveryLimiter, asyncHandler(async (req, res) => {
  if (!config.emailConfigured) {
    respondEmailConfigurationError(res);
    return;
  }
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!validEmail(email)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid email address.' } });
    return;
  }
  const account = await findIdentityByEmail(email);
  if (account && account.is_active === 1) {
    const token = createOneTimeSecret();
    await createPasswordResetToken(
      account.id,
      hashSecret(token),
      new Date(Date.now() + config.passwordResetTokenTtlMinutes * 60_000).toISOString(),
    );
    try {
      await sendAccountEmail(
        email,
        'Reset your Global Minds Academy password',
        `Reset your password within ${config.passwordResetTokenTtlMinutes} minutes:\n\n${passwordResetLink(token)}\n\nIf you did not request this, you can ignore this message.`,
      );
    } catch (error) {
      console.error('[auth] Password-reset email delivery failed:', error);
      respondEmailDeliveryError(res);
      return;
    }
  }
  res.status(202).json({ success: true, data: { message: 'If an active account exists for this email, password reset instructions will be sent.' } });
}));

app.post('/api/auth/reset-password', requireSameOrigin, recoveryLimiter, asyncHandler(async (req, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (token.length < 40 || token.length > 100 || !validPassword(password)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide a valid reset link and a password of 12–72 bytes.' } });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const reset = await resetIdentityPassword(hashSecret(token), passwordHash, currentIpAddress(req));
  if (!reset) {
    res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Password reset link is invalid or expired.' } });
    return;
  }
  res.json({ success: true, data: { message: 'Password reset. Sign in with your new password.' } });
}));

app.post('/api/auth/change-password', requireSameOrigin, authenticate, asyncHandler(async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (!req.auth || !currentPassword || !validPassword(newPassword)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Current password and a new password of 12–72 bytes are required.' } });
    return;
  }
  const passwordHash = await findIdentityPasswordHash(req.auth.id);
  if (!passwordHash || !(await bcrypt.compare(currentPassword, passwordHash))) {
    res.status(400).json({ success: false, error: { code: 'CURRENT_PASSWORD_INVALID', message: 'Current password is incorrect.' } });
    return;
  }
  await changeIdentityPassword(req.auth.id, await bcrypt.hash(newPassword, 12), currentIpAddress(req));
  res.clearCookie(sessionCookieName, sessionCookieOptions);
  res.json({ success: true, data: { message: 'Password changed. Sign in again with your new password.' } });
}));

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = req.auth!;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.first_name} ${user.last_name}`.trim(),
      phone: user.phone,
      country: user.country,
      city: user.city,
      education: user.education,
      experience: user.experience,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      isActive: true,
      emailVerified: user.email_verified === 1,
      permissions: user.permissions,
    },
  });
});

app.get('/api/auth/sessions', authenticate, asyncHandler(async (req, res) => {
  res.json({ success: true, data: await listIdentitySessions(req.auth!.id) });
}));

app.delete('/api/auth/sessions/:id', requireSameOrigin, authenticate, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const revoked = await revokeIdentitySession(req.auth!.id, id, currentIpAddress(req));
  if (!revoked) {
    res.status(404).json({ success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Active session not found.' } });
    return;
  }
  if (id === req.authSessionId) res.clearCookie(sessionCookieName, sessionCookieOptions);
  res.status(204).end();
}));

app.post('/api/auth/logout-all', requireSameOrigin, authenticate, asyncHandler(async (req, res) => {
  const count = await revokeAllIdentitySessions(req.auth!.id, undefined, currentIpAddress(req));
  res.clearCookie(sessionCookieName, sessionCookieOptions);
  res.json({ success: true, data: { revokedSessions: count } });
}));

app.post('/api/auth/logout', requireSameOrigin, asyncHandler(async (req, res) => {
  const token = req.cookies?.[sessionCookieName];
  if (typeof token === 'string') {
    try {
      const claims = jwt.verify(token, config.jwtSecret, {
        issuer: 'global-academy-auth',
        audience: 'global-academy',
      });
      if (typeof claims !== 'string' && claims.sub && typeof claims.sid === 'string') {
        await revokeIdentitySession(claims.sub, claims.sid, currentIpAddress(req));
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) throw error;
    }
  }
  res.clearCookie(sessionCookieName, sessionCookieOptions);
  res.status(204).end();
}));

app.get('/api/certificates/verify/:certificateId', asyncHandler(async (req, res) => {
  const certificateId = routeParam(req.params.certificateId).trim();
  if (!certificateId || certificateId.length > 128) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid certificate ID is required.' } });
    return;
  }
  const result = await getDataDatabase().query<Record<string, unknown>>(
    `SELECT c.certificate_id AS "certificateId", c.course_name AS "courseName",
      c.issued_at AS "issuedAt", c.status, u.first_name AS "firstName", u.last_name AS "lastName"
     FROM certificates c JOIN users u ON u.id = c.student_id
     WHERE c.certificate_id = ?`,
    [certificateId],
  );
  if (!result.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certificate not found.' } });
    return;
  }
  const certificate = result.rows[0];
  res.json({
    success: true,
    data: {
      certificateId: certificate.certificateId,
      courseName: certificate.courseName,
      issuedAt: certificate.issuedAt,
      studentName: `${certificate.firstName ?? ''} ${certificate.lastName ?? ''}`.trim(),
      valid: certificate.status === 'active',
      status: certificate.status,
    },
  });
}));

app.use('/api/admin', requireSameOriginForMutations, authenticate);
const operationalDb = () => getDataDatabase();
const requireStudentRole: RequestHandler = (req, res, next) => {
  if (req.auth?.role !== 'STUDENT') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Student account access is required.' } });
    return;
  }
  next();
};
const bodyObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const bodyString = (body: Record<string, unknown>, key: string, max = 500): string =>
  typeof body[key] === 'string' ? (body[key] as string).trim().slice(0, max) : '';
const validProfilePhoto = (value: string): boolean => {
  if (!value) return true;
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  return Boolean(match && Buffer.from(match[2], 'base64').byteLength <= 12 * 1024);
};
const pagination = (req: express.Request, defaultPageSize = 25) => ({
  page: Number(req.query.page ?? 1),
  pageSize: Number(req.query.pageSize ?? defaultPageSize),
});
const validPage = ({ page, pageSize }: { page: number; pageSize: number }) =>
  Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100;
const mutationAudit = (
  req: express.Request,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, string | number | boolean> = {},
) => insertAuditLog(req.auth?.id ?? null, action, resourceType, resourceId, metadata, currentIpAddress(req));

app.get('/api/student/dashboard', authenticate, requirePermission('profile.read'), requireStudentRole, asyncHandler(async (req, res) => {
  const studentId = req.auth!.id;
  const database = operationalDb();
  const [profile, courses, batches, attendance, attendanceCount, internships, certificates, activity, announcements] = await Promise.all([
    database.query<Record<string, unknown>>(
      `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName",
        u.phone, sp.country, sp.city, sp.education, sp.experience,
        sp.interested_course AS "interestedCourse", sp.learning_mode AS "learningMode",
        sp.career_goal AS "careerGoal", u.created_at AS "createdAt"
       FROM users u JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ? AND u.is_active = 1`,
      [studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT e.id, c.slug, c.published_json AS content, e.status, e.enrolled_at AS "enrolledAt"
       FROM course_enrollments e
       JOIN cms_records c ON c.id = e.course_record_id
       WHERE e.student_id = ? AND e.status != 'withdrawn' AND c.status = 'published'
       ORDER BY e.enrolled_at DESC`,
      [studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT b.id, b.name, b.code, b.description, b.start_date AS "startDate",
        b.end_date AS "endDate", b.schedule_json AS schedule, b.status
       FROM batch_students bs JOIN batches b ON b.id = bs.batch_id
       WHERE bs.student_id = ? AND b.status != 'archived'
       ORDER BY b.start_date DESC, b.name`,
      [studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT a.id, a.attendance_date AS "attendanceDate", a.status, a.notes,
        b.name AS "batchName"
       FROM attendance a JOIN batches b ON b.id = a.batch_id
       WHERE a.student_id = ?
       ORDER BY a.attendance_date DESC LIMIT 100`,
      [studentId],
    ),
    database.query<{ total: number }>(
      'SELECT COUNT(*) AS total FROM attendance WHERE student_id = ?',
      [studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT ia.id, ia.status, ia.progress, ia.applied_at AS "appliedAt",
        ia.updated_at AS "updatedAt", ia.notes, i.title, i.company, i.description,
        i.start_date AS "startDate", i.end_date AS "endDate",
        u.first_name || ' ' || u.last_name AS "supervisorName"
       FROM internship_applications ia
       JOIN internships i ON i.id = ia.internship_id
       LEFT JOIN users u ON u.id = ia.supervisor_id
       WHERE ia.student_id = ?
       ORDER BY ia.updated_at DESC`,
      [studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT id, certificate_id AS "certificateId", course_name AS "courseName",
        issued_at AS "issuedAt", status
       FROM certificates WHERE student_id = ? AND status = 'active'
       ORDER BY issued_at DESC`,
      [studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT id, action, resource_type AS "resourceType", resource_id AS "resourceId",
        metadata_json AS metadata, created_at AS "createdAt"
       FROM audit_logs
       WHERE actor_user_id = ?
         OR (resource_type = 'student' AND resource_id = ?)
         OR (resource_type = 'attendance' AND resource_id IN (
           SELECT id FROM attendance WHERE student_id = ?
         ))
         OR (resource_type = 'batch' AND resource_id IN (
           SELECT batch_id FROM batch_students WHERE student_id = ?
         ))
         OR (resource_type = 'internship_application' AND resource_id IN (
           SELECT id FROM internship_applications WHERE student_id = ?
         ))
         OR (resource_type = 'course_enrollment' AND resource_id IN (
           SELECT id FROM course_enrollments WHERE student_id = ?
         ))
         OR (resource_type = 'certificate' AND resource_id IN (
           SELECT id FROM certificates WHERE student_id = ?
         ))
       ORDER BY created_at DESC LIMIT 25`,
      [studentId, studentId, studentId, studentId, studentId, studentId, studentId],
    ),
    database.query<Record<string, unknown>>(
      `SELECT id, title, body, published_at AS "publishedAt"
       FROM student_announcements WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 50`,
    ),
  ]);
  if (!profile.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'STUDENT_PROFILE_NOT_FOUND', message: 'Student profile is unavailable.' } });
    return;
  }
  const enrolledCourses = courses.rows.map(course => {
    if (typeof course.content !== 'string') {
      throw new Error(`Published course content is invalid for ${String(course.slug)}.`);
    }
    let content: unknown;
    try {
      content = JSON.parse(course.content);
    } catch (error) {
      throw new Error(`Published course content is invalid for ${String(course.slug)}.`, { cause: error });
    }
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      throw new Error(`Published course content is invalid for ${String(course.slug)}.`);
    }
    const details = content as Record<string, unknown>;
    return {
      ...course,
      title: typeof details.title === 'string' ? details.title : String(course.slug),
      shortDescription: typeof details.shortDescription === 'string' ? details.shortDescription : '',
      thumbnail: typeof details.thumbnail === 'string' ? details.thumbnail : '',
    };
  });
  const assignedBatches = batches.rows.map(batch => {
    let schedule: unknown;
    try {
      schedule = JSON.parse(String(batch.schedule));
    } catch (error) {
      throw new Error(`Stored schedule is invalid for batch ${String(batch.code)}.`, { cause: error });
    }
    return { ...batch, schedule };
  });
  res.json({
    success: true,
    data: {
      profile: profile.rows[0],
      courses: enrolledCourses,
      batches: assignedBatches,
      attendance: attendance.rows,
      attendanceTotal: Number(attendanceCount.rows[0]?.total ?? 0),
      internships: internships.rows,
      certificates: certificates.rows,
      activity: activity.rows,
      announcements: announcements.rows,
    },
  });
}));

app.patch('/api/student/profile', requireSameOrigin, authenticate, requirePermission('profile.update'), requireStudentRole, asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const allowedFields: Record<string, { column: string; max: number; table: 'users' | 'student_profiles' }> = {
    fullName: { column: 'name', max: 120, table: 'users' },
    phone: { column: 'phone', max: 32, table: 'users' },
    country: { column: 'country', max: 100, table: 'student_profiles' },
    city: { column: 'city', max: 100, table: 'student_profiles' },
    education: { column: 'education', max: 200, table: 'student_profiles' },
    experience: { column: 'experience', max: 2000, table: 'student_profiles' },
    careerGoal: { column: 'career_goal', max: 1000, table: 'student_profiles' },
  };
  const updates = Object.entries(body).flatMap(([key, rawValue]) => {
    const field = allowedFields[key];
    if (!field || typeof rawValue !== 'string') return [];
    return [{ key, field, value: rawValue.trim() }];
  });
  if (!updates.length || updates.length !== Object.keys(body).length
    || updates.some(({ key, field, value }) => value.length > field.max
      || (key === 'fullName' && value.length < 2))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Update only your name, phone, country, city, education, experience, or career goal using valid text values.' } });
    return;
  }
  const studentId = req.auth!.id;
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    for (const { key, field, value } of updates) {
      if (key === 'fullName') {
        const parts = value.split(/\s+/);
        const firstName = parts.shift() ?? '';
        await operationalDb().execute(
          'UPDATE users SET first_name = ?, last_name = ?, updated_at = ? WHERE id = ?',
          [firstName, parts.join(' '), now, studentId],
        );
      } else {
        const table = field.table;
        await operationalDb().execute(
          `UPDATE ${table} SET ${field.column} = ?, updated_at = ? WHERE ${table === 'users' ? 'id' : 'user_id'} = ?`,
          [value, now, studentId],
        );
      }
    }
    await mutationAudit(req, 'student.profile.updated', 'student', studentId);
  });
  const profile = await operationalDb().query<Record<string, unknown>>(
    `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName",
      u.phone, sp.country, sp.city, sp.education, sp.experience,
      sp.interested_course AS "interestedCourse", sp.learning_mode AS "learningMode",
      sp.career_goal AS "careerGoal", u.created_at AS "createdAt"
     FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = ?`,
    [studentId],
  );
  res.json({ success: true, data: { profile: profile.rows[0] } });
}));

app.get('/api/admin/operations/status', requirePermission('users.read'), asyncHandler(async (_req, res) => {
  res.json({ success: true, data: { modules: await getOperationsStatus() } });
}));

app.get('/api/admin/operations/summary', requirePermission('users.read'), asyncHandler(async (_req, res) => {
  const database = operationalDb();
  const [students, activeBatches, todayAttendance, openInternships, activeCertificates] = await Promise.all([
    database.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       WHERE ur.role_id = 'role_student' AND u.is_active = 1`,
    ),
    database.query<{ total: number }>("SELECT COUNT(*) AS total FROM batches WHERE status = 'active'"),
    database.query<{ total: number }>(
      'SELECT COUNT(*) AS total FROM attendance WHERE attendance_date = ?',
      [new Date().toISOString().slice(0, 10)],
    ),
    database.query<{ total: number }>("SELECT COUNT(*) AS total FROM internships WHERE status = 'open'"),
    database.query<{ total: number }>("SELECT COUNT(*) AS total FROM certificates WHERE status = 'active'"),
  ]);
  res.json({
    success: true,
    data: {
      students: Number(students.rows[0]?.total ?? 0),
      activeBatches: Number(activeBatches.rows[0]?.total ?? 0),
      todayAttendance: Number(todayAttendance.rows[0]?.total ?? 0),
      openInternships: Number(openInternships.rows[0]?.total ?? 0),
      activeCertificates: Number(activeCertificates.rows[0]?.total ?? 0),
    },
  });
}));

app.get('/api/admin/system/health', requirePermission('settings.manage'), asyncHandler(async (_req, res) => {
  try {
    const [database, migrations, modules] = await Promise.all([
      operationalDb().query<{ connected: number }>('SELECT 1 AS connected'),
      operationalDb().query<{ total: number }>('SELECT COUNT(*) AS total FROM schema_migrations'),
      getOperationsStatus(),
    ]);
    res.json({
      success: true,
      data: {
        api: 'ok',
        database: database.rows[0]?.connected === 1 ? 'connected' : 'unavailable',
        databaseDriver: config.databaseDriver,
        migrationsApplied: Number(migrations.rows[0]?.total ?? 0),
        operationalModules: modules,
      },
    });
  } catch (error) {
    console.error('[health] Admin health check failed:', error);
    res.status(503).json({
      success: false,
      error: { code: 'HEALTH_CHECK_FAILED', message: 'Database health could not be confirmed.' },
    });
  }
}));

app.get('/api/admin/students/:id/enrollments', requirePermission('enrollments.manage'), asyncHandler(async (req, res) => {
  const studentId = routeParam(req.params.id);
  const student = await operationalDb().query<{ id: string }>(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
     WHERE u.id = ? AND ur.role_id = 'role_student'`,
    [studentId],
  );
  if (!student.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student was not found.' } });
    return;
  }
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT e.id, e.status, e.enrolled_at AS "enrolledAt", e.updated_at AS "updatedAt",
      c.slug, c.published_json AS content
     FROM course_enrollments e JOIN cms_records c ON c.id = e.course_record_id
     WHERE e.student_id = ? ORDER BY e.enrolled_at DESC`,
    [studentId],
  );
  const enrollments = result.rows.map(enrollment => {
    let content: unknown;
    try {
      content = JSON.parse(String(enrollment.content));
    } catch (error) {
      throw new Error(`Published course content is invalid for ${String(enrollment.slug)}.`, { cause: error });
    }
    const details = content && typeof content === 'object' && !Array.isArray(content)
      ? content as Record<string, unknown>
      : undefined;
    if (!details) throw new Error(`Published course content is invalid for ${String(enrollment.slug)}.`);
    return {
      ...enrollment,
      title: typeof details.title === 'string' ? details.title : String(enrollment.slug),
    };
  });
  res.json({ success: true, data: { enrollments } });
}));

app.post('/api/admin/students/:id/enrollments', requirePermission('enrollments.manage'), asyncHandler(async (req, res) => {
  const studentId = routeParam(req.params.id);
  const courseSlug = bodyString(bodyObject(req.body), 'courseSlug', 120);
  if (!studentId || !validSlug(courseSlug)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Choose a valid student and published course.' } });
    return;
  }
  const [student, course] = await Promise.all([
    operationalDb().query<{ id: string }>(
      `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
       WHERE u.id = ? AND ur.role_id = 'role_student' AND u.is_active = 1`,
      [studentId],
    ),
    operationalDb().query<{ id: string }>(
      `SELECT id FROM cms_records WHERE section = 'courses' AND slug = ? AND status = 'published'`,
      [courseSlug],
    ),
  ]);
  if (!student.rows[0] || !course.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'STUDENT_OR_COURSE_NOT_FOUND', message: 'An active student or published course was not found.' } });
    return;
  }
  const now = new Date().toISOString();
  let enrollmentId = '';
  await operationalDb().transaction(async () => {
    const existing = await operationalDb().query<{ id: string }>(
      'SELECT id FROM course_enrollments WHERE student_id = ? AND course_record_id = ?',
      [studentId, course.rows[0].id],
    );
    if (existing.rows[0]) {
      enrollmentId = existing.rows[0].id;
      await operationalDb().execute(
        `UPDATE course_enrollments SET status = 'active', updated_at = ?, assigned_by = ? WHERE id = ?`,
        [now, req.auth!.id, enrollmentId],
      );
    } else {
      enrollmentId = randomUUID();
      await operationalDb().execute(
        `INSERT INTO course_enrollments
         (id, student_id, course_record_id, status, enrolled_at, updated_at, assigned_by)
         VALUES (?, ?, ?, 'active', ?, ?, ?)`,
        [enrollmentId, studentId, course.rows[0].id, now, now, req.auth!.id],
      );
    }
    await mutationAudit(req, 'student.course.enrolled', 'course_enrollment', enrollmentId, { courseSlug });
  });
  res.status(201).json({ success: true, data: { id: enrollmentId, status: 'active', enrolledAt: now } });
}));

app.patch('/api/admin/enrollments/:id', requirePermission('enrollments.manage'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const status = bodyObject(req.body).status;
  if (!id || !['active', 'completed', 'withdrawn'].includes(String(status))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Select active, completed, or withdrawn enrollment status.' } });
    return;
  }
  const result = await operationalDb().query<{ id: string }>('SELECT id FROM course_enrollments WHERE id = ?', [id]);
  if (!result.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'ENROLLMENT_NOT_FOUND', message: 'Course enrollment was not found.' } });
    return;
  }
  await operationalDb().transaction(async () => {
    await operationalDb().execute('UPDATE course_enrollments SET status = ?, updated_at = ? WHERE id = ?', [status as string, new Date().toISOString(), id]);
    await mutationAudit(req, 'student.course.enrollment.updated', 'course_enrollment', id, { status: status as string });
  });
  res.json({ success: true, data: { id, status } });
}));

app.get('/api/admin/announcements', requirePermission('announcements.manage'), asyncHandler(async (req, res) => {
  const paging = pagination(req);
  if (!validPage(paging)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination.' } });
    return;
  }
  const count = await operationalDb().query<{ total: number }>('SELECT COUNT(*) AS total FROM student_announcements');
  const announcements = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, title, body, status, created_at AS "createdAt", updated_at AS "updatedAt",
      published_at AS "publishedAt"
     FROM student_announcements ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  res.json({ success: true, data: { announcements: announcements.rows, total: Number(count.rows[0]?.total ?? 0), ...paging } });
}));

app.post('/api/admin/announcements', requirePermission('announcements.manage'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const title = bodyString(body, 'title', 160);
  const text = bodyString(body, 'body', 10_000);
  const status = body.status ?? 'draft';
  if (title.length < 2 || !text || typeof status !== 'string' || !['draft', 'published'].includes(status)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide a title, announcement text, and draft or published status.' } });
    return;
  }
  const now = new Date().toISOString();
  const id = randomUUID();
  await operationalDb().transaction(async () => {
    await operationalDb().execute(
      `INSERT INTO student_announcements
       (id, title, body, status, created_by, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, text, status, req.auth!.id, now, now, status === 'published' ? now : null],
    );
    await mutationAudit(req, 'student.announcement.created', 'student_announcement', id, { status: String(status) });
  });
  res.status(201).json({ success: true, data: { id, title, body: text, status, createdAt: now, updatedAt: now, publishedAt: status === 'published' ? now : null } });
}));

app.patch('/api/admin/announcements/:id', requirePermission('announcements.manage'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = bodyObject(req.body);
  const title = body.title === undefined ? undefined : bodyString(body, 'title', 160);
  const text = body.body === undefined ? undefined : bodyString(body, 'body', 10_000);
  const status = body.status;
  if (!id || (title === undefined && text === undefined && status === undefined)
    || title !== undefined && title.length < 2
    || text !== undefined && !text
    || status !== undefined && !['draft', 'published', 'archived'].includes(String(status))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide valid announcement fields.' } });
    return;
  }
  const current = await operationalDb().query<{ id: string; title: string; body: string; status: string; published_at: string | null }>(
    'SELECT id, title, body, status, published_at FROM student_announcements WHERE id = ?',
    [id],
  );
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'ANNOUNCEMENT_NOT_FOUND', message: 'Announcement was not found.' } });
    return;
  }
  const nextStatus = status === undefined ? current.rows[0].status : String(status);
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute(
      `UPDATE student_announcements SET title = ?, body = ?, status = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
      [
        title ?? current.rows[0].title,
        text ?? current.rows[0].body,
        nextStatus,
        now,
        nextStatus === 'published' ? current.rows[0].published_at ?? now : null,
        id,
      ],
    );
    await mutationAudit(req, 'student.announcement.updated', 'student_announcement', id, { status: nextStatus });
  });
  res.json({ success: true, data: { id, status: nextStatus, updatedAt: now } });
}));

app.get('/api/admin/students', requirePermission('students.read'), asyncHandler(async (req, res) => {
  const paging = pagination(req);
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '';
  const archived = req.query.archived === 'true';
  if (!validPage(paging)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination.' } });
    return;
  }
  const filters = ["r.name = 'STUDENT'", 'sp.is_archived = ?'];
  const values: (string | number)[] = [archived ? 1 : 0];
  if (req.auth!.role === 'TRAINER') {
    filters.push(`EXISTS (
      SELECT 1 FROM batch_students scoped_students
      JOIN batch_trainers scoped_trainers ON scoped_trainers.batch_id = scoped_students.batch_id
      WHERE scoped_students.student_id = u.id AND scoped_trainers.trainer_id = ?
    )`);
    values.push(req.auth!.id);
  }
  if (search) {
    filters.push("(lower(u.email) LIKE ? OR lower(u.first_name || ' ' || u.last_name) LIKE ?)");
    values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  const where = `WHERE ${filters.join(' AND ')}`;
  const count = await operationalDb().query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM users u JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id JOIN student_profiles sp ON sp.user_id = u.id ${where}`,
    values,
  );
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName",
      u.phone, u.is_active AS "isActive", u.email_verified AS "emailVerified",
      u.created_at AS "createdAt", sp.country, sp.city, sp.education, sp.experience,
      sp.interested_course AS "interestedCourse", sp.learning_mode AS "learningMode",
      sp.career_goal AS "careerGoal", sp.photo,
      sp.is_archived AS "isArchived", sp.archived_at AS "archivedAt"
     FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
     JOIN student_profiles sp ON sp.user_id = u.id ${where}
     ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...values, paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  res.json({
    success: true,
    data: {
      students: result.rows.map(row => ({ ...row, fullName: `${row.firstName} ${row.lastName}`.trim() })),
      total: Number(count.rows[0]?.total ?? 0),
    },
  });
}));

app.post('/api/admin/students', requirePermission('students.create'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const email = bodyString(body, 'email', 254).toLowerCase();
  const fullName = bodyString(body, 'fullName', 120);
  const phone = bodyString(body, 'phone', 32);
  const photo = bodyString(body, 'photo', 17_000);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 2 || fullName.length > 120 || phone.length > 32
    || !validProfilePhoto(photo)
    || Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide valid student details and a PNG, JPEG, or WebP profile photo up to 12 KB.' } });
    return;
  }
  if (await emailIsRegistered(email)) {
    res.status(400).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'Email address is already registered.' } });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  const parts = fullName.split(/\s+/);
  const firstName = parts.shift() ?? '';
  const lastName = parts.join(' ');
  const passwordHash = await bcrypt.hash(password, 10);
  await operationalDb().transaction(async () => {
    await operationalDb().execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
      [id, email, passwordHash, firstName, lastName, phone, now, now],
    );
    await operationalDb().execute(
      `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, 'role_student', ?)`,
      [id, now],
    );
    await operationalDb().execute(
      `INSERT INTO student_profiles (user_id, country, city, education, experience, interested_course, learning_mode, career_goal, photo, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, bodyString(body, 'country', 100), bodyString(body, 'city', 100),
        bodyString(body, 'education', 200), bodyString(body, 'experience', 2000),
        bodyString(body, 'interestedCourse', 200), bodyString(body, 'learningMode', 50),
        bodyString(body, 'careerGoal', 1000), photo, now,
      ],
    );
    await mutationAudit(req, 'student.created', 'student', id);
  });
  res.status(201).json({
    success: true,
    data: {
      student: {
        id, email, firstName, lastName, fullName, phone,
        country: bodyString(body, 'country', 100), city: bodyString(body, 'city', 100),
        education: bodyString(body, 'education', 200), experience: bodyString(body, 'experience', 2000),
        interestedCourse: bodyString(body, 'interestedCourse', 200),
        learningMode: bodyString(body, 'learningMode', 50), careerGoal: bodyString(body, 'careerGoal', 1000),
        photo,
        isActive: 1, isArchived: 0, createdAt: now,
      },
    },
  });
}));

app.get('/api/admin/students/:id', requirePermission('students.read'), asyncHandler(async (req, res) => {
  const filters = ["u.id = ?", "r.name = 'STUDENT'"];
  const values: string[] = [routeParam(req.params.id)];
  if (req.auth!.role === 'TRAINER') {
    filters.push(`EXISTS (
      SELECT 1 FROM batch_students scoped_students
      JOIN batch_trainers scoped_trainers ON scoped_trainers.batch_id = scoped_students.batch_id
      WHERE scoped_students.student_id = u.id AND scoped_trainers.trainer_id = ?
    )`);
    values.push(req.auth!.id);
  }
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName",
      u.phone, u.is_active AS "isActive", u.email_verified AS "emailVerified",
      u.created_at AS "createdAt", sp.country, sp.city, sp.education, sp.experience,
      sp.interested_course AS "interestedCourse", sp.learning_mode AS "learningMode",
      sp.career_goal AS "careerGoal", sp.photo,
      sp.is_archived AS "isArchived", sp.archived_at AS "archivedAt"
     FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
     JOIN student_profiles sp ON sp.user_id = u.id WHERE ${filters.join(' AND ')}`,
    values,
  );
  const row = result.rows[0];
  if (!row) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
    return;
  }
  res.json({ success: true, data: { student: { ...row, fullName: `${row.firstName} ${row.lastName}`.trim() } } });
}));

app.patch('/api/admin/students/:id', requirePermission('students.update'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = bodyObject(req.body);
  const allowed: Record<string, { column: string; max: number; table: 'users' | 'student_profiles' }> = {
    email: { column: 'email', max: 254, table: 'users' },
    fullName: { column: 'full_name', max: 120, table: 'users' },
    phone: { column: 'phone', max: 32, table: 'users' },
    country: { column: 'country', max: 100, table: 'student_profiles' },
    city: { column: 'city', max: 100, table: 'student_profiles' },
    education: { column: 'education', max: 200, table: 'student_profiles' },
    experience: { column: 'experience', max: 2000, table: 'student_profiles' },
    interestedCourse: { column: 'interested_course', max: 200, table: 'student_profiles' },
    learningMode: { column: 'learning_mode', max: 50, table: 'student_profiles' },
    careerGoal: { column: 'career_goal', max: 1000, table: 'student_profiles' },
    photo: { column: 'photo', max: 17_000, table: 'student_profiles' },
  };
  const changed = Object.keys(body).filter(key => key in allowed);
  if (!changed.length || Object.entries(body).some(([key, value]) => !(key in allowed) || typeof value !== 'string')) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide supported student fields as strings.' } });
    return;
  }
  const current = await operationalDb().query<{ id: string }>(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id WHERE u.id = ? AND r.name = 'STUDENT'`,
    [id],
  );
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
    return;
  }
  if (body.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bodyString(body, 'email', 254))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid email address is required.' } });
    return;
  }
  if (body.fullName !== undefined && bodyString(body, 'fullName', 120).length < 2) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name must contain at least two characters.' } });
    return;
  }
  if (body.photo !== undefined && (typeof body.photo !== 'string'
    || !validProfilePhoto(bodyString(body, 'photo', 17_000)))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Profile photos must be PNG, JPEG, or WebP images up to 12 KB.' } });
    return;
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    const userUpdates: Array<[string, string]> = [];
    const profileUpdates: Array<[string, string]> = [];
    for (const key of changed) {
      const field = allowed[key];
      let value = bodyString(body, key, field.max);
      if (key === 'email') value = value.toLowerCase();
      if (key === 'fullName') {
        const parts = value.split(/\s+/);
        const firstName = parts.shift() ?? '';
        userUpdates.push(['first_name', firstName], ['last_name', parts.join(' ')]);
      } else if (field.table === 'users') userUpdates.push([field.column, value]);
      else profileUpdates.push([field.column, value]);
    }
    for (const [column, value] of userUpdates) {
      await operationalDb().execute(`UPDATE users SET ${column} = ?, updated_at = ? WHERE id = ?`, [value, now, id]);
    }
    for (const [column, value] of profileUpdates) {
      await operationalDb().execute(`UPDATE student_profiles SET ${column} = ?, updated_at = ? WHERE user_id = ?`, [value, now, id]);
    }
    await mutationAudit(req, 'student.updated', 'student', id, { fields: changed.length });
  });
  const updated = await operationalDb().query<Record<string, unknown>>(
    `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName", u.phone,
      sp.country, sp.city, sp.education, sp.experience, sp.interested_course AS "interestedCourse",
      sp.learning_mode AS "learningMode", sp.career_goal AS "careerGoal", sp.photo
     FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = ?`,
    [id],
  );
  const student = updated.rows[0];
  res.json({ success: true, data: { student: { ...student, fullName: `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() } } });
}));

for (const [action, permission, archivedValue] of [
  ['archive', 'students.archive', 1],
  ['restore', 'students.restore', 0],
] as const) {
  app.post(`/api/admin/students/:id/${action}`, requirePermission(permission), asyncHandler(async (req, res) => {
    const id = routeParam(req.params.id);
    const student = await operationalDb().query<{ id: string }>(
      `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id WHERE u.id = ? AND r.name = 'STUDENT'`,
      [id],
    );
    if (!student.rows[0]) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
      return;
    }
    const now = new Date().toISOString();
    await operationalDb().transaction(async () => {
      await operationalDb().execute(
        'UPDATE student_profiles SET is_archived = ?, archived_at = ?, updated_at = ? WHERE user_id = ?',
        [archivedValue, archivedValue ? now : null, now, id],
      );
      await mutationAudit(req, `student.${action}d`, 'student', id);
    });
    const result = await operationalDb().query<Record<string, unknown>>(
      `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName",
       u.phone, sp.country, sp.city, sp.education, sp.experience,
       sp.interested_course AS "interestedCourse", sp.learning_mode AS "learningMode",
       sp.career_goal AS "careerGoal", sp.is_archived AS "isArchived", sp.archived_at AS "archivedAt"
       FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = ?`,
      [id],
    );
    res.json({ success: true, data: { student: { ...result.rows[0], fullName: `${result.rows[0]?.firstName ?? ''} ${result.rows[0]?.lastName ?? ''}`.trim() } } });
  }));
}

app.delete('/api/admin/students/:id', requirePermission('students.delete'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const result = await operationalDb().query<{ id: string }>(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id WHERE u.id = ? AND r.name = 'STUDENT'`,
    [id],
  );
  if (!result.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
    return;
  }
  await operationalDb().transaction(async () => {
    await mutationAudit(req, 'student.deleted', 'student', id);
    await operationalDb().execute('DELETE FROM users WHERE id = ?', [id]);
  });
  res.json({ success: true, data: { deleted: true, id } });
}));

app.get('/api/admin/batches', requirePermission('batches.read'), asyncHandler(async (req, res) => {
  const paging = pagination(req);
  if (!validPage(paging)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination.' } });
    return;
  }
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '';
  const statuses = ['planned', 'active', 'completed', 'cancelled', 'archived'];
  if (status && !statuses.includes(status)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid batch status.' } });
    return;
  }
  const filters: string[] = [];
  const values: string[] = [];
  if (req.auth!.role === 'TRAINER') {
    filters.push('EXISTS (SELECT 1 FROM batch_trainers scoped_trainers WHERE scoped_trainers.batch_id = batches.id AND scoped_trainers.trainer_id = ?)');
    values.push(req.auth!.id);
  }
  if (status) { filters.push('status = ?'); values.push(status); }
  if (search) { filters.push('(lower(name) LIKE ? OR lower(code) LIKE ?)'); values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`); }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await operationalDb().query<{ total: number }>(`SELECT COUNT(*) AS total FROM batches ${where}`, values);
  const list = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, name, code, description, start_date AS "startDate", end_date AS "endDate",
      schedule_json AS "scheduleJson", status, created_at AS "createdAt", updated_at AS "updatedAt",
      archived_at AS "archivedAt" FROM batches ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  const batches = await Promise.all(list.rows.map(async batch => {
    const [students, trainers] = await Promise.all([
      operationalDb().query<{ student_id: string }>('SELECT student_id FROM batch_students WHERE batch_id = ?', [String(batch.id)]),
      operationalDb().query<{ trainer_id: string }>('SELECT trainer_id FROM batch_trainers WHERE batch_id = ?', [String(batch.id)]),
    ]);
    let schedule: unknown = {};
    try { schedule = JSON.parse(String(batch.scheduleJson)); } catch { /* malformed stored JSON */ }
    const { scheduleJson: _scheduleJson, ...rest } = batch;
    return { ...rest, schedule, studentIds: students.rows.map(row => row.student_id), trainerIds: trainers.rows.map(row => row.trainer_id) };
  }));
  res.json({ success: true, data: { batches, total: Number(count.rows[0]?.total ?? 0) } });
}));

app.get('/api/admin/batches/:id', requirePermission('batches.read'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  if (req.auth!.role === 'TRAINER') {
    const assignment = await operationalDb().query<{ id: string }>(
      'SELECT batch_id AS id FROM batch_trainers WHERE batch_id = ? AND trainer_id = ?',
      [id, req.auth!.id],
    );
    if (!assignment.rows[0]) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
      return;
    }
  }
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, name, code, description, start_date AS "startDate", end_date AS "endDate",
      schedule_json AS "scheduleJson", status, created_at AS "createdAt", updated_at AS "updatedAt",
      archived_at AS "archivedAt" FROM batches WHERE id = ?`,
    [id],
  );
  if (!result.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
    return;
  }
  const [students, trainers] = await Promise.all([
    operationalDb().query<{ student_id: string }>('SELECT student_id FROM batch_students WHERE batch_id = ?', [id]),
    operationalDb().query<{ trainer_id: string }>('SELECT trainer_id FROM batch_trainers WHERE batch_id = ?', [id]),
  ]);
  const batch = result.rows[0];
  let schedule: unknown = {};
  try { schedule = JSON.parse(String(batch.scheduleJson)); } catch { /* malformed stored JSON */ }
  const { scheduleJson: _scheduleJson, ...rest } = batch;
  res.json({
    success: true,
    data: { batch: { ...rest, schedule, studentIds: students.rows.map(row => row.student_id), trainerIds: trainers.rows.map(row => row.trainer_id) } },
  });
}));

app.post('/api/admin/batches', requirePermission('batches.create'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const name = bodyString(body, 'name', 160);
  const code = bodyString(body, 'code', 64).toUpperCase();
  const description = bodyString(body, 'description', 4000);
  const status = bodyString(body, 'status', 20) || 'planned';
  const startDate = bodyString(body, 'startDate', 32);
  const endDate = bodyString(body, 'endDate', 32);
  const schedule = body.schedule && typeof body.schedule === 'object' && !Array.isArray(body.schedule) ? body.schedule : {};
  if (name.length < 2 || !/^[A-Z0-9_-]{2,64}$/.test(code)
    || !['planned', 'active', 'completed', 'cancelled', 'archived'].includes(status)
    || (startDate && Number.isNaN(Date.parse(startDate))) || (endDate && Number.isNaN(Date.parse(endDate)))
    || (startDate && endDate && Date.parse(startDate) > Date.parse(endDate))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide valid batch name, code, dates, and status.' } });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  try {
    await operationalDb().transaction(async () => {
      await operationalDb().execute(
        `INSERT INTO batches (id, name, code, description, start_date, end_date, schedule_json, status, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, code, description, startDate || null, endDate || null, JSON.stringify(schedule), status, req.auth!.id, now, now],
      );
      await mutationAudit(req, 'batch.created', 'batch', id);
    });
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) {
      res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Batch code already exists.' } });
      return;
    }
    throw error;
  }
  res.status(201).json({ success: true, data: { batch: { id, name, code, description, startDate: startDate || null, endDate: endDate || null, schedule, status, createdAt: now, updatedAt: now, studentIds: [], trainerIds: [] } } });
}));

app.patch('/api/admin/batches/:id', requirePermission('batches.update'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = bodyObject(req.body);
  const current = await operationalDb().query<{ id: string; start_date: string | null; end_date: string | null }>(
    'SELECT id, start_date, end_date FROM batches WHERE id = ?',
    [id],
  );
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
    return;
  }
  const fields: Array<[string, string | number | null]> = [];
  const textLimits: Record<string, number> = { name: 160, code: 64, description: 4000, startDate: 32, endDate: 32 };
  const columns: Record<string, string> = { name: 'name', code: 'code', description: 'description', startDate: 'start_date', endDate: 'end_date' };
  for (const [key, max] of Object.entries(textLimits)) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== 'string' || (body[key] as string).trim().length > max) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: `Invalid ${key}.` } });
        return;
      }
      fields.push([columns[key], bodyString(body, key, max)]);
    }
  }
  if (body.schedule !== undefined) {
    if (!body.schedule || typeof body.schedule !== 'object' || Array.isArray(body.schedule)) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Schedule must be an object.' } });
      return;
    }
    fields.push(['schedule_json', JSON.stringify(body.schedule)]);
  }
  if (body.status !== undefined) {
    if (!['planned', 'active', 'completed', 'cancelled', 'archived'].includes(String(body.status))) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid batch status.' } });
      return;
    }
    fields.push(['status', String(body.status)]);
  }
  const startDate = body.startDate === undefined ? current.rows[0].start_date ?? '' : bodyString(body, 'startDate', 32);
  const endDate = body.endDate === undefined ? current.rows[0].end_date ?? '' : bodyString(body, 'endDate', 32);
  const updatedName = body.name === undefined ? undefined : bodyString(body, 'name', 160);
  const updatedCode = body.code === undefined ? undefined : bodyString(body, 'code', 64).toUpperCase();
  if (updatedName !== undefined && updatedName.length < 2
    || updatedCode !== undefined && !/^[A-Z0-9_-]{2,64}$/.test(updatedCode)
    || startDate && Number.isNaN(Date.parse(startDate))
    || endDate && Number.isNaN(Date.parse(endDate))
    || startDate && endDate && Date.parse(startDate) > Date.parse(endDate)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid batch name, code, or date range.' } });
    return;
  }
  if (updatedCode !== undefined) {
    const codeField = fields.findIndex(([column]) => column === 'code');
    if (codeField >= 0) fields[codeField]![1] = updatedCode;
  }
  if (!fields.length) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid batch fields provided.' } });
    return;
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    for (const [column, value] of fields) await operationalDb().execute(`UPDATE batches SET ${column} = ?, updated_at = ? WHERE id = ?`, [value, now, id]);
    await mutationAudit(req, 'batch.updated', 'batch', id, { fields: fields.length });
  });
  const updated = await operationalDb().query<Record<string, unknown>>('SELECT id, name, code, description, start_date AS "startDate", end_date AS "endDate", schedule_json AS "scheduleJson", status, updated_at AS "updatedAt" FROM batches WHERE id = ?', [id]);
  const batch = updated.rows[0]!;
  let schedule: unknown = {};
  try { schedule = JSON.parse(String(batch.scheduleJson)); } catch { /* malformed stored JSON */ }
  const { scheduleJson: _scheduleJson, ...rest } = batch;
  res.json({ success: true, data: { batch: { ...rest, schedule } } });
}));

app.put('/api/admin/batches/:id/students', requirePermission('batches.assign'), asyncHandler(async (req, res) => {
  const batchId = routeParam(req.params.id);
  const ids = bodyObject(req.body).studentIds;
  if (!Array.isArray(ids) || ids.length > 1000 || ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'studentIds must be a unique array of student IDs.' } });
    return;
  }
  const exists = await operationalDb().query<{ id: string }>('SELECT id FROM batches WHERE id = ?', [batchId]);
  if (!exists.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
    return;
  }
  if (ids.length) {
    const valid = await operationalDb().query<{ id: string }>(
      `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
       JOIN student_profiles sp ON sp.user_id = u.id
       WHERE r.name = 'STUDENT' AND sp.is_archived = 0 AND u.id IN (${ids.map(() => '?').join(',')})`,
      ids as string[],
    );
    if (valid.rows.length !== ids.length) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'One or more student IDs are invalid or archived.' } });
      return;
    }
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute('DELETE FROM batch_students WHERE batch_id = ?', [batchId]);
    for (const studentId of ids as string[]) await operationalDb().execute('INSERT INTO batch_students (batch_id, student_id, assigned_at) VALUES (?, ?, ?)', [batchId, studentId, now]);
    await mutationAudit(req, 'batch.students.assigned', 'batch', batchId, { count: ids.length });
  });
  res.json({ success: true, data: { batch: { id: batchId, studentIds: ids } } });
}));

app.put('/api/admin/batches/:id/trainers', requirePermission('batches.assign'), asyncHandler(async (req, res) => {
  const batchId = routeParam(req.params.id);
  const ids = bodyObject(req.body).trainerIds;
  if (!Array.isArray(ids) || ids.length > 1000 || ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'trainerIds must be a unique array of trainer IDs.' } });
    return;
  }
  const exists = await operationalDb().query<{ id: string }>('SELECT id FROM batches WHERE id = ?', [batchId]);
  if (!exists.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
    return;
  }
  if (ids.length) {
    const valid = await operationalDb().query<{ id: string }>(
      `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
       WHERE r.name = 'TRAINER' AND u.id IN (${ids.map(() => '?').join(',')})`,
      ids as string[],
    );
    if (valid.rows.length !== ids.length) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'One or more trainer IDs are invalid.' } });
      return;
    }
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute('DELETE FROM batch_trainers WHERE batch_id = ?', [batchId]);
    for (const trainerId of ids as string[]) await operationalDb().execute('INSERT INTO batch_trainers (batch_id, trainer_id, assigned_at) VALUES (?, ?, ?)', [batchId, trainerId, now]);
    await mutationAudit(req, 'batch.trainers.assigned', 'batch', batchId, { count: ids.length });
  });
  res.json({ success: true, data: { batch: { id: batchId, trainerIds: ids } } });
}));

app.post('/api/admin/batches/:id/archive', requirePermission('batches.archive'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const found = await operationalDb().query<{ id: string }>('SELECT id FROM batches WHERE id = ?', [id]);
  if (!found.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
    return;
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute("UPDATE batches SET status = 'archived', archived_at = ?, updated_at = ? WHERE id = ?", [now, now, id]);
    await mutationAudit(req, 'batch.archived', 'batch', id);
  });
  res.json({ success: true, data: { batch: { id, status: 'archived', archivedAt: now } } });
}));

app.delete('/api/admin/batches/:id', requirePermission('batches.delete'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const found = await operationalDb().query<{ id: string }>('SELECT id FROM batches WHERE id = ?', [id]);
  if (!found.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found.' } });
    return;
  }
  await operationalDb().transaction(async () => {
    await mutationAudit(req, 'batch.deleted', 'batch', id);
    await operationalDb().execute('DELETE FROM batches WHERE id = ?', [id]);
  });
  res.json({ success: true, data: { deleted: true, id } });
}));

app.get('/api/admin/attendance/report', requirePermission('attendance.read'), asyncHandler(async (req, res) => {
  const batchId = typeof req.query.batchId === 'string' ? req.query.batchId : '';
  const from = typeof req.query.from === 'string' ? req.query.from : '';
  const to = typeof req.query.to === 'string' ? req.query.to : '';
  if ((from && Number.isNaN(Date.parse(from))) || (to && Number.isNaN(Date.parse(to)))
    || (from && to && Date.parse(from) > Date.parse(to))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid attendance report date range.' } });
    return;
  }
  const filters: string[] = [];
  const values: string[] = [];
  if (req.auth!.role === 'TRAINER') {
    filters.push('EXISTS (SELECT 1 FROM batch_trainers scoped_trainers WHERE scoped_trainers.batch_id = a.batch_id AND scoped_trainers.trainer_id = ?)');
    values.push(req.auth!.id);
  }
  if (batchId) { filters.push('a.batch_id = ?'); values.push(batchId); }
  if (from) { filters.push('a.attendance_date >= ?'); values.push(from); }
  if (to) { filters.push('a.attendance_date <= ?'); values.push(to); }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT a.batch_id AS "batchId", b.name AS "batchName", a.student_id AS "studentId",
      u.first_name AS "firstName", u.last_name AS "lastName", a.status, COUNT(*) AS count
     FROM attendance a JOIN batches b ON b.id = a.batch_id JOIN users u ON u.id = a.student_id
     ${where} GROUP BY a.batch_id, b.name, a.student_id, u.first_name, u.last_name, a.status
     ORDER BY b.name, u.last_name, u.first_name, a.status`,
    values,
  );
  res.json({ success: true, data: { report: result.rows, total: result.rows.length } });
}));

app.get('/api/admin/attendance', requirePermission('attendance.read'), asyncHandler(async (req, res) => {
  const paging = pagination(req, 50);
  const batchId = typeof req.query.batchId === 'string' ? req.query.batchId : '';
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : '';
  const date = typeof req.query.date === 'string' ? req.query.date : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '';
  if (!validPage(paging) || (date && Number.isNaN(Date.parse(date)))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid attendance filters or pagination.' } });
    return;
  }
  const filters: string[] = [];
  const values: (string | number)[] = [];
  if (req.auth!.role === 'TRAINER') {
    filters.push('EXISTS (SELECT 1 FROM batch_trainers scoped_trainers WHERE scoped_trainers.batch_id = a.batch_id AND scoped_trainers.trainer_id = ?)');
    values.push(req.auth!.id);
  }
  if (batchId) { filters.push('a.batch_id = ?'); values.push(batchId); }
  if (studentId) { filters.push('a.student_id = ?'); values.push(studentId); }
  if (date) { filters.push('a.attendance_date = ?'); values.push(date.slice(0, 10)); }
  if (search) {
    filters.push("(lower(u.first_name || ' ' || u.last_name) LIKE ? OR lower(b.name) LIKE ? OR lower(a.status) LIKE ?)");
    values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await operationalDb().query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM attendance a JOIN batches b ON b.id = a.batch_id JOIN users u ON u.id = a.student_id ${where}`,
    values,
  );
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT a.id, a.batch_id AS "batchId", b.name AS "batchName", a.student_id AS "studentId",
      u.first_name AS "firstName", u.last_name AS "lastName", a.attendance_date AS "attendanceDate",
      a.status, a.notes, a.marked_by AS "markedBy", a.created_at AS "createdAt", a.updated_at AS "updatedAt"
     FROM attendance a JOIN batches b ON b.id = a.batch_id JOIN users u ON u.id = a.student_id
     ${where} ORDER BY a.attendance_date DESC, u.last_name, u.first_name LIMIT ? OFFSET ?`,
    [...values, paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  res.json({ success: true, data: { attendance: result.rows.map(row => ({ ...row, studentName: `${row.firstName} ${row.lastName}`.trim() })), total: Number(count.rows[0]?.total ?? 0) } });
}));

app.put('/api/admin/attendance', requirePermission('attendance.manage'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const batchId = bodyString(body, 'batchId', 100);
  const studentId = bodyString(body, 'studentId', 100);
  const attendanceDate = bodyString(body, 'attendanceDate', 32);
  const status = bodyString(body, 'status', 16);
  const notes = bodyString(body, 'notes', 2000);
  if (!batchId || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)
    || Number.isNaN(Date.parse(`${attendanceDate}T00:00:00Z`))
    || !['present', 'absent', 'late', 'excused'].includes(status)
    || (body.notes !== undefined && typeof body.notes !== 'string')) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide batchId, studentId, YYYY-MM-DD attendanceDate, status, and optional notes.' } });
    return;
  }
  const trainerConstraint = req.auth!.role === 'TRAINER' ? ' AND EXISTS (SELECT 1 FROM batch_trainers bt WHERE bt.batch_id = bs.batch_id AND bt.trainer_id = ?)' : '';
  const membershipValues: string[] = [studentId, batchId];
  if (req.auth!.role === 'TRAINER') membershipValues.push(req.auth!.id);
  const member = await operationalDb().query<{ id: string }>(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
     JOIN batch_students bs ON bs.student_id = u.id
     WHERE u.id = ? AND r.name = 'STUDENT' AND bs.batch_id = ?${trainerConstraint}`,
    membershipValues,
  );
  if (!member.rows[0]) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Student must be assigned to the batch.' } });
    return;
  }
  const prior = await operationalDb().query<{ id: string }>(
    'SELECT id FROM attendance WHERE batch_id = ? AND student_id = ? AND attendance_date = ?',
    [batchId, studentId, attendanceDate],
  );
  const id = prior.rows[0]?.id ?? randomUUID();
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    if (prior.rows[0]) {
      await operationalDb().execute(
        'UPDATE attendance SET status = ?, notes = ?, marked_by = ?, updated_at = ? WHERE id = ?',
        [status, notes, req.auth!.id, now, id],
      );
      await mutationAudit(req, 'attendance.updated', 'attendance', id);
    } else {
      await operationalDb().execute(
        `INSERT INTO attendance (id, batch_id, student_id, attendance_date, status, notes, marked_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, batchId, studentId, attendanceDate, status, notes, req.auth!.id, now, now],
      );
      await mutationAudit(req, 'attendance.created', 'attendance', id);
    }
  });
  res.status(prior.rows[0] ? 200 : 201).json({
    success: true,
    data: {
      attendance: {
        id, batchId, studentId, attendanceDate, status, notes,
        markedBy: req.auth!.id, createdAt: prior.rows[0] ? undefined : now, updatedAt: now,
      },
    },
  });
}));

app.patch('/api/admin/attendance/:id', requirePermission('attendance.manage'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = bodyObject(req.body);
  const allowed = ['status', 'notes', 'attendanceDate'];
  if (!Object.keys(body).length || Object.keys(body).some(key => !allowed.includes(key))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Supported fields are status, notes, and attendanceDate.' } });
    return;
  }
  if (body.status !== undefined && !['present', 'absent', 'late', 'excused'].includes(String(body.status))
    || body.notes !== undefined && typeof body.notes !== 'string'
    || body.attendanceDate !== undefined && (typeof body.attendanceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.attendanceDate))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid attendance fields.' } });
    return;
  }
  const current = await operationalDb().query<{ id: string; batch_id: string }>('SELECT id, batch_id FROM attendance WHERE id = ?', [id]);
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attendance record not found.' } });
    return;
  }
  if (req.auth!.role === 'TRAINER') {
    const assignment = await operationalDb().query<{ id: string }>(
      'SELECT batch_id AS id FROM batch_trainers WHERE batch_id = ? AND trainer_id = ?',
      [current.rows[0].batch_id, req.auth!.id],
    );
    if (!assignment.rows[0]) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attendance record not found.' } });
      return;
    }
  }
  const columns = { status: 'status', notes: 'notes', attendanceDate: 'attendance_date' } as const;
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    for (const key of Object.keys(body) as Array<keyof typeof columns>) {
      const value = key === 'notes' ? bodyString(body, key, 2000) : body[key] as string;
      await operationalDb().execute(`UPDATE attendance SET ${columns[key]} = ?, marked_by = ?, updated_at = ? WHERE id = ?`, [value, req.auth!.id, now, id]);
    }
    await mutationAudit(req, 'attendance.updated', 'attendance', id, { fields: Object.keys(body).length });
  });
  const updated = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, batch_id AS "batchId", student_id AS "studentId", attendance_date AS "attendanceDate", status, notes, marked_by AS "markedBy", updated_at AS "updatedAt" FROM attendance WHERE id = ?`,
    [id],
  );
  res.json({ success: true, data: { attendance: updated.rows[0] } });
}));

app.get('/api/admin/internships', requirePermission('internships.read'), asyncHandler(async (req, res) => {
  const paging = pagination(req);
  if (!validPage(paging)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination.' } });
    return;
  }
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '';
  if (status && !['draft', 'open', 'closed', 'archived'].includes(status)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid internship status.' } });
    return;
  }
  const filters: string[] = [];
  const values: (string | number)[] = [];
  if (status) { filters.push('status = ?'); values.push(status); }
  if (search) { filters.push('(lower(title) LIKE ? OR lower(company) LIKE ?)'); values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`); }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await operationalDb().query<{ total: number }>(`SELECT COUNT(*) AS total FROM internships ${where}`, values);
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, title, company, description, status, start_date AS "startDate", end_date AS "endDate",
      created_at AS "createdAt", updated_at AS "updatedAt", archived_at AS "archivedAt"
     FROM internships ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  res.json({ success: true, data: { internships: result.rows, total: Number(count.rows[0]?.total ?? 0) } });
}));

app.get('/api/admin/internships/:id([0-9a-fA-F-]{36})', requirePermission('internships.read'), asyncHandler(async (req, res) => {
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, title, company, description, status, start_date AS "startDate",
      end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt",
      archived_at AS "archivedAt" FROM internships WHERE id = ?`,
    [routeParam(req.params.id)],
  );
  if (!result.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Internship not found.' } });
    return;
  }
  res.json({ success: true, data: { internship: result.rows[0] } });
}));

app.post('/api/admin/internships', requirePermission('internships.create'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const title = bodyString(body, 'title', 200);
  const company = bodyString(body, 'company', 200);
  const description = bodyString(body, 'description', 5000);
  const status = bodyString(body, 'status', 20) || 'open';
  const startDate = bodyString(body, 'startDate', 32);
  const endDate = bodyString(body, 'endDate', 32);
  if (title.length < 2 || !['draft', 'open', 'closed', 'archived'].includes(status)
    || startDate && Number.isNaN(Date.parse(startDate)) || endDate && Number.isNaN(Date.parse(endDate))
    || startDate && endDate && Date.parse(startDate) > Date.parse(endDate)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide valid internship title, dates, and status.' } });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute(
      `INSERT INTO internships (id, title, company, description, status, start_date, end_date, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, company, description, status, startDate || null, endDate || null, req.auth!.id, now, now],
    );
    await mutationAudit(req, 'internship.created', 'internship', id);
  });
  res.status(201).json({ success: true, data: { internship: { id, title, company, description, status, startDate: startDate || null, endDate: endDate || null, createdAt: now, updatedAt: now } } });
}));

app.patch('/api/admin/internships/:id', requirePermission('internships.update'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = bodyObject(req.body);
  const current = await operationalDb().query<{ id: string }>('SELECT id FROM internships WHERE id = ?', [id]);
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Internship not found.' } });
    return;
  }
  const columns: Record<string, string> = { title: 'title', company: 'company', description: 'description', status: 'status', startDate: 'start_date', endDate: 'end_date' };
  const limits: Record<string, number> = { title: 200, company: 200, description: 5000, status: 20, startDate: 32, endDate: 32 };
  const fields: Array<[string, string]> = [];
  for (const key of Object.keys(body)) {
    if (!columns[key] || typeof body[key] !== 'string' || (body[key] as string).length > limits[key]) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Unsupported or invalid internship field.' } });
      return;
    }
    const value = bodyString(body, key, limits[key]);
    if (key === 'status' && !['draft', 'open', 'closed', 'archived'].includes(value)
      || ['startDate', 'endDate'].includes(key) && value && Number.isNaN(Date.parse(value))
      || key === 'title' && value.length < 2) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: `Invalid ${key}.` } });
      return;
    }
    fields.push([columns[key], value]);
  }
  if (!fields.length) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No internship fields provided.' } });
    return;
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    for (const [column, value] of fields) await operationalDb().execute(`UPDATE internships SET ${column} = ?, updated_at = ? WHERE id = ?`, [value || null, now, id]);
    await mutationAudit(req, 'internship.updated', 'internship', id, { fields: fields.length });
  });
  const updated = await operationalDb().query<Record<string, unknown>>('SELECT id, title, company, description, status, start_date AS "startDate", end_date AS "endDate", updated_at AS "updatedAt" FROM internships WHERE id = ?', [id]);
  res.json({ success: true, data: { internship: updated.rows[0] } });
}));

app.delete('/api/admin/internships/:id', requirePermission('internships.delete'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const current = await operationalDb().query<{ id: string }>('SELECT id FROM internships WHERE id = ?', [id]);
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Internship not found.' } });
    return;
  }
  await operationalDb().transaction(async () => {
    await mutationAudit(req, 'internship.deleted', 'internship', id);
    await operationalDb().execute('DELETE FROM internships WHERE id = ?', [id]);
  });
  res.json({ success: true, data: { deleted: true, id } });
}));

app.get('/api/admin/internships/applications', requirePermission('applications.read'), asyncHandler(async (req, res) => {
  const paging = pagination(req);
  const internshipId = typeof req.query.internshipId === 'string' ? req.query.internshipId : '';
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : '';
  if (!validPage(paging)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pagination.' } });
    return;
  }
  const filters: string[] = [];
  const values: (string | number)[] = [];
  if (internshipId) { filters.push('a.internship_id = ?'); values.push(internshipId); }
  if (studentId) { filters.push('a.student_id = ?'); values.push(studentId); }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await operationalDb().query<{ total: number }>(`SELECT COUNT(*) AS total FROM internship_applications a ${where}`, values);
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT a.id, a.internship_id AS "internshipId", i.title AS "internshipTitle",
      a.student_id AS "studentId", u.first_name AS "firstName", u.last_name AS "lastName",
      a.supervisor_id AS "supervisorId", a.status, a.progress, a.notes,
      a.applied_at AS "appliedAt", a.updated_at AS "updatedAt"
     FROM internship_applications a JOIN internships i ON i.id = a.internship_id
     JOIN users u ON u.id = a.student_id ${where}
     ORDER BY a.applied_at DESC LIMIT ? OFFSET ?`,
    [...values, paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  res.json({ success: true, data: { applications: result.rows.map(row => ({ ...row, studentName: `${row.firstName} ${row.lastName}`.trim() })), total: Number(count.rows[0]?.total ?? 0) } });
}));

app.post('/api/admin/internships/:id/applications', requirePermission('applications.manage'), asyncHandler(async (req, res) => {
  const internshipId = routeParam(req.params.id);
  const studentId = bodyString(bodyObject(req.body), 'studentId', 100);
  if (!studentId) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'studentId is required.' } });
    return;
  }
  const eligible = await operationalDb().query<{ id: string }>(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
     JOIN roles r ON r.id = ur.role_id WHERE u.id = ? AND r.name = 'STUDENT'`,
    [studentId],
  );
  const internship = await operationalDb().query<{ id: string }>("SELECT id FROM internships WHERE id = ? AND status = 'open'", [internshipId]);
  if (!eligible.rows[0] || !internship.rows[0]) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'An existing student and open internship are required.' } });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  try {
    await operationalDb().transaction(async () => {
      await operationalDb().execute(
        `INSERT INTO internship_applications (id, internship_id, student_id, status, progress, notes, applied_at, updated_at)
         VALUES (?, ?, ?, 'applied', 0, '', ?, ?)`,
        [id, internshipId, studentId, now, now],
      );
      await mutationAudit(req, 'internship.application.created', 'internship_application', id, { internshipId, studentId });
    });
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) {
      res.status(400).json({ success: false, error: { code: 'ALREADY_APPLIED', message: 'Student has already applied to this internship.' } });
      return;
    }
    throw error;
  }
  res.status(201).json({ success: true, data: { application: { id, internshipId, studentId, supervisorId: null, status: 'applied', progress: 0, notes: '', appliedAt: now, updatedAt: now } } });
}));

app.patch('/api/admin/internships/applications/:id', requirePermission('applications.manage'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = bodyObject(req.body);
  const allowed = ['status', 'progress', 'notes', 'supervisorId'];
  if (!Object.keys(body).length || Object.keys(body).some(key => !allowed.includes(key))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Supported fields are status, progress, notes, and supervisorId.' } });
    return;
  }
  if (body.status !== undefined && !['applied', 'reviewing', 'accepted', 'rejected', 'in_progress', 'completed'].includes(String(body.status))
    || body.progress !== undefined && (!Number.isInteger(body.progress) || Number(body.progress) < 0 || Number(body.progress) > 100)
    || body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > 4000)
    || body.supervisorId !== undefined && body.supervisorId !== null && typeof body.supervisorId !== 'string') {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid application status, progress, notes, or supervisorId.' } });
    return;
  }
  const current = await operationalDb().query<{ id: string }>('SELECT id FROM internship_applications WHERE id = ?', [id]);
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Internship application not found.' } });
    return;
  }
  const supervisorId = body.supervisorId === null ? null : typeof body.supervisorId === 'string' ? body.supervisorId : undefined;
  if (supervisorId) {
    const trainer = await operationalDb().query<{ id: string }>(
      `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id WHERE u.id = ? AND r.name = 'TRAINER'`,
      [supervisorId],
    );
    if (!trainer.rows[0]) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'supervisorId must identify a trainer.' } });
      return;
    }
  }
  const columns: Record<string, string> = { status: 'status', progress: 'progress', notes: 'notes', supervisorId: 'supervisor_id' };
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    for (const key of Object.keys(body)) {
      const value = key === 'notes' ? bodyString(body, key, 4000) : key === 'supervisorId' ? supervisorId ?? null : body[key] as string | number;
      await operationalDb().execute(`UPDATE internship_applications SET ${columns[key]} = ?, updated_at = ? WHERE id = ?`, [value, now, id]);
    }
    await mutationAudit(req, 'internship.application.updated', 'internship_application', id, { fields: Object.keys(body).length });
  });
  const updated = await operationalDb().query<Record<string, unknown>>(
    `SELECT id, internship_id AS "internshipId", student_id AS "studentId", supervisor_id AS "supervisorId",
     status, progress, notes, applied_at AS "appliedAt", updated_at AS "updatedAt"
     FROM internship_applications WHERE id = ?`,
    [id],
  );
  res.json({ success: true, data: { application: updated.rows[0] } });
}));

app.patch('/api/admin/internships/applications/:id/supervisor', requirePermission('applications.manage'), asyncHandler(async (req, res) => {
  const supervisorId = bodyObject(req.body).supervisorId;
  if (supervisorId !== null && typeof supervisorId !== 'string') {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'supervisorId must be a trainer ID or null.' } });
    return;
  }
  const id = routeParam(req.params.id);
  const application = await operationalDb().query<{ id: string }>('SELECT id FROM internship_applications WHERE id = ?', [id]);
  if (!application.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Internship application not found.' } });
    return;
  }
  if (typeof supervisorId === 'string') {
    const trainer = await operationalDb().query<{ id: string }>(`SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id WHERE u.id = ? AND r.name = 'TRAINER'`, [supervisorId]);
    if (!trainer.rows[0]) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'supervisorId must identify a trainer.' } });
      return;
    }
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute('UPDATE internship_applications SET supervisor_id = ?, updated_at = ? WHERE id = ?', [supervisorId, now, id]);
    await mutationAudit(req, 'internship.application.supervisor_updated', 'internship_application', id);
  });
  res.json({ success: true, data: { application: { id, supervisorId, updatedAt: now } } });
}));

app.patch('/api/admin/internships/applications/:id/progress', requirePermission('applications.manage'), asyncHandler(async (req, res) => {
  const progress = bodyObject(req.body).progress;
  if (!Number.isInteger(progress) || Number(progress) < 0 || Number(progress) > 100) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'progress must be an integer from 0 to 100.' } });
    return;
  }
  const id = routeParam(req.params.id);
  const current = await operationalDb().query<{ id: string }>('SELECT id FROM internship_applications WHERE id = ?', [id]);
  if (!current.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Internship application not found.' } });
    return;
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute('UPDATE internship_applications SET progress = ?, updated_at = ? WHERE id = ?', [progress as number, now, id]);
    await mutationAudit(req, 'internship.application.progress_updated', 'internship_application', id, { progress: progress as number });
  });
  res.json({ success: true, data: { application: { id, progress, updatedAt: now } } });
}));

app.get('/api/admin/certificates', requirePermission('certificates.read'), asyncHandler(async (req, res) => {
  const paging = pagination(req);
  const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : '';
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '';
  if (!validPage(paging) || status && !['active', 'revoked'].includes(status)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid certificate filters or pagination.' } });
    return;
  }
  const filters: string[] = [];
  const values: (string | number)[] = [];
  if (studentId) { filters.push('c.student_id = ?'); values.push(studentId); }
  if (status) { filters.push('c.status = ?'); values.push(status); }
  if (search) {
    filters.push("(lower(c.certificate_id) LIKE ? OR lower(c.course_name) LIKE ? OR lower(u.first_name || ' ' || u.last_name) LIKE ?)");
    values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await operationalDb().query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM certificates c JOIN users u ON u.id = c.student_id ${where}`,
    values,
  );
  const result = await operationalDb().query<Record<string, unknown>>(
    `SELECT c.id, c.certificate_id AS "certificateId", c.student_id AS "studentId",
      u.first_name AS "firstName", u.last_name AS "lastName", c.course_name AS "courseName",
      c.issued_at AS "issuedAt", c.status, c.revoked_at AS "revokedAt", c.created_at AS "createdAt"
     FROM certificates c JOIN users u ON u.id = c.student_id ${where}
     ORDER BY c.issued_at DESC LIMIT ? OFFSET ?`,
    [...values, paging.pageSize, (paging.page - 1) * paging.pageSize],
  );
  res.json({ success: true, data: { certificates: result.rows.map(row => ({ ...row, studentName: `${row.firstName} ${row.lastName}`.trim() })), total: Number(count.rows[0]?.total ?? 0) } });
}));

app.post('/api/admin/certificates', requirePermission('certificates.create'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const studentId = bodyString(body, 'studentId', 100);
  const courseName = bodyString(body, 'courseName', 200);
  const suppliedId = bodyString(body, 'certificateId', 128);
  if (!studentId || courseName.length < 2 || suppliedId && !/^[A-Za-z0-9_-]{4,128}$/.test(suppliedId)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'studentId and a valid courseName are required; certificateId, if supplied, must be 4-128 safe characters.' } });
    return;
  }
  const student = await operationalDb().query<{ id: string }>(
    `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
     WHERE u.id = ? AND r.name = 'STUDENT'`,
    [studentId],
  );
  if (!student.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
    return;
  }
  const id = randomUUID();
  const certificateId = suppliedId || `CERT-${randomUUID().replaceAll('-', '').toUpperCase()}`;
  const now = new Date().toISOString();
  try {
    await operationalDb().transaction(async () => {
      await operationalDb().execute(
        `INSERT INTO certificates (id, certificate_id, student_id, course_name, issued_at, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
        [id, certificateId, studentId, courseName, now, req.auth!.id, now],
      );
      await mutationAudit(req, 'certificate.issued', 'certificate', id, { certificateId, studentId });
    });
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) {
      res.status(400).json({ success: false, error: { code: 'DUPLICATE_CERTIFICATE_ID', message: 'Certificate ID already exists.' } });
      return;
    }
    throw error;
  }
  res.status(201).json({ success: true, data: { certificate: { id, certificateId, studentId, courseName, issuedAt: now, status: 'active' } } });
}));

app.post('/api/admin/certificates/:id/revoke', requirePermission('certificates.revoke'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const found = await operationalDb().query<{ id: string; status: string }>('SELECT id, status FROM certificates WHERE id = ?', [id]);
  if (!found.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certificate not found.' } });
    return;
  }
  const now = new Date().toISOString();
  await operationalDb().transaction(async () => {
    await operationalDb().execute("UPDATE certificates SET status = 'revoked', revoked_at = ?, revoked_by = ? WHERE id = ?", [now, req.auth!.id, id]);
    await mutationAudit(req, 'certificate.revoked', 'certificate', id);
  });
  res.json({ success: true, data: { certificate: { id, status: 'revoked', revokedAt: now } } });
}));

app.delete('/api/admin/certificates/:id', requirePermission('certificates.delete'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const found = await operationalDb().query<{ id: string }>('SELECT id FROM certificates WHERE id = ?', [id]);
  if (!found.rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certificate not found.' } });
    return;
  }
  await operationalDb().transaction(async () => {
    await mutationAudit(req, 'certificate.deleted', 'certificate', id);
    await operationalDb().execute('DELETE FROM certificates WHERE id = ?', [id]);
  });
  res.json({ success: true, data: { deleted: true, id } });
}));
app.get('/api/admin/session', requirePermission('users.read'), (req, res) => {
  const user = req.auth!;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.first_name} ${user.last_name}`.trim(),
      permissions: user.permissions,
    },
  });
});
app.get('/api/admin/roles', requirePermission('roles.read'), asyncHandler(async (_req, res) => {
  res.json({ success: true, data: { roles: await listIdentityRoles() } });
}));
app.get('/api/admin/permissions', requirePermission('roles.read'), asyncHandler(async (_req, res) => {
  res.json({ success: true, data: { permissions: await listIdentityPermissionNames() } });
}));
app.put('/api/admin/roles/:role/permissions', requirePermission('roles.manage'), asyncHandler(async (req, res) => {
  const role = routeParam(req.params.role);
  const roles = ['ADMIN', 'CONTENT_MANAGER', 'TRAINER', 'STUDENT'] as const;
  const permissions = req.body?.permissions;
  if (!roles.includes(role as typeof roles[number])
    || !Array.isArray(permissions)
    || permissions.length > 200
    || permissions.some((permission: unknown) => typeof permission !== 'string' || permission.length > 120)
    || new Set(permissions).size !== permissions.length) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide a supported role and a unique list of permission names.' } });
    return;
  }
  const availablePermissions = new Set(await listIdentityPermissionNames());
  if (permissions.some((permission: string) => !availablePermissions.has(permission))) {
    res.status(400).json({ success: false, error: { code: 'UNKNOWN_PERMISSION', message: 'One or more permission names are not registered.' } });
    return;
  }
  const updated = await replaceIdentityRolePermissions(
    role as typeof roles[number],
    permissions,
    req.auth!.id,
    currentIpAddress(req),
  );
  if (!updated) {
    res.status(404).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Role not found.' } });
    return;
  }
  res.json({ success: true, data: { role, permissions } });
}));
app.get('/api/admin/audit-logs', requirePermission('audit_logs.read'), asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 50);
  const action = typeof req.query.action === 'string' ? req.query.action.trim() : undefined;
  const actorId = typeof req.query.actorId === 'string' ? req.query.actorId.trim() : undefined;
  const resourceType = typeof req.query.resourceType === 'string' ? req.query.resourceType.trim() : undefined;
  const resourceId = typeof req.query.resourceId === 'string' ? req.query.resourceId.trim() : undefined;
  const from = typeof req.query.from === 'string' ? req.query.from : undefined;
  const to = typeof req.query.to === 'string' ? req.query.to : undefined;
  if (!Number.isInteger(page) || page < 1
    || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100
    || [action, actorId, resourceType, resourceId].some(value => value !== undefined && value.length > 200)
    || from !== undefined && Number.isNaN(Date.parse(from))
    || to !== undefined && Number.isNaN(Date.parse(to))
    || from && to && Date.parse(from) > Date.parse(to)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid audit log pagination.' } });
    return;
  }
  const { entries, total } = await listAuditLogs({ page, pageSize, action, actorId, resourceType, resourceId, from, to });
  res.json({ success: true, data: { auditLogs: entries, entries, total } });
}));
app.post('/api/admin/users', requirePermission('users.create'), asyncHandler(async (req, res) => {
  const body = bodyObject(req.body);
  const email = bodyString(body, 'email', 254).toLowerCase();
  const fullName = bodyString(body, 'fullName', 120);
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role;
  const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'TRAINER', 'STUDENT'] as const;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 2 || fullName.length > 120
    || Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72
    || typeof role !== 'string' || !roles.includes(role as typeof roles[number])) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide a valid email, full name, password between 12 and 72 bytes, and supported role.' } });
    return;
  }
  if (req.auth!.role !== 'SUPER_ADMIN' && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(role)) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only a Super Admin may create privileged accounts.' } });
    return;
  }
  if (await emailIsRegistered(email)) {
    res.status(409).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'Email address is already registered.' } });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  const parts = fullName.split(/\s+/);
  const firstName = parts.shift() ?? '';
  const lastName = parts.join(' ');
  const passwordHash = await bcrypt.hash(password, 12);
  await operationalDb().transaction(async () => {
    await operationalDb().execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, email_verified, email_verified_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [id, email, passwordHash, firstName, lastName, bodyString(body, 'phone', 32), now, now, now],
    );
    await operationalDb().execute(
      `INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by) VALUES (?, ?, ?, ?)`,
      [id, `role_${role.toLowerCase()}`, now, req.auth!.id],
    );
    if (role === 'STUDENT') {
      await operationalDb().execute(
        `INSERT INTO student_profiles (user_id, country, city, education, experience, interested_course, learning_mode, career_goal, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, bodyString(body, 'country', 100), bodyString(body, 'city', 100),
          bodyString(body, 'education', 200), bodyString(body, 'experience', 2000),
          '', '', '', now,
        ],
      );
    }
    await mutationAudit(req, 'identity.account.created', 'user', id, { role });
  });
  res.status(201).json({
    success: true,
    data: { user: { id, email, firstName, lastName, fullName, role, isActive: true, emailVerified: true, createdAt: now } },
  });
}));
app.get('/api/admin/users', requirePermission('users.read'), asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 25);
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'TRAINER', 'STUDENT'] as const;
  if (!Number.isInteger(page) || page < 1
    || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100
    || search.length > 120 || (role !== undefined && !roles.includes(role as typeof roles[number]))) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid user listing filters.' } });
    return;
  }
  const result = await listManagedIdentities({
    page,
    pageSize,
    search,
    role: role as typeof roles[number] | undefined,
  });
  res.json({ success: true, data: result });
}));
app.patch('/api/admin/users/:id', requirePermission('users.update'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const role = req.body?.role;
  const isActive = req.body?.isActive;
  const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'TRAINER', 'STUDENT'] as const;
  if (!id || (role === undefined && isActive === undefined)
    || (role !== undefined && !roles.includes(role))
    || (isActive !== undefined && typeof isActive !== 'boolean')) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide a valid role and/or account status.' } });
    return;
  }
  if (role !== undefined && req.auth!.role !== 'SUPER_ADMIN'
    && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(role)) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only a Super Admin may assign privileged roles.' } });
    return;
  }
  if (isActive === false && !req.auth!.permissions.includes('users.deactivate')) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to deactivate accounts.' } });
    return;
  }
  const updated = await updateManagedIdentity({
    actorId: req.auth!.id,
    actorRole: req.auth!.role,
    targetId: id,
    role,
    isActive,
    ipAddress: currentIpAddress(req),
  });
  if (!updated) {
    res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND_OR_FORBIDDEN', message: 'User was not found or this account change is not allowed.' } });
    return;
  }
  res.json({ success: true, data: { updated: true } });
}));
app.get('/api/admin/enquiries', requirePermission('enquiries.read'), asyncHandler(async (_req, res) => {
  res.json({ enquiries: await listEnquiries() });
}));
app.patch('/api/admin/enquiries/:id', requirePermission('enquiries.update'), asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id);
  const body = req.body;
  const validStatuses = ['new', 'contacted', 'enrolled', 'not-interested', 'follow-up'];
  const status = body?.status;
  const assignedTo = typeof body?.assignedTo === 'string' ? body.assignedTo.trim() : '';
  const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';
  const followUpDate = body?.followUpDate === null || body?.followUpDate === ''
    ? null
    : typeof body?.followUpDate === 'string' ? body.followUpDate : undefined;
  const validDate = followUpDate === null || (typeof followUpDate === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(followUpDate)
    && !Number.isNaN(Date.parse(`${followUpDate}T00:00:00Z`))
    && new Date(`${followUpDate}T00:00:00Z`).toISOString().slice(0, 10) === followUpDate);

  if (!id || typeof status !== 'string' || !validStatuses.includes(status)
    || typeof body?.assignedTo !== 'string' || assignedTo.length > 120
    || typeof body?.notes !== 'string' || notes.length > 5000
    || followUpDate === undefined || !validDate) {
    res.status(400).json({ message: 'Please provide valid enquiry update details.' });
    return;
  }

  const enquiry = await updateEnquiry(id, {
    status: status as 'new' | 'contacted' | 'enrolled' | 'not-interested' | 'follow-up',
    assignedTo,
    followUpDate,
    notes,
  });
  if (!enquiry) {
    res.status(404).json({ message: 'Enquiry not found.' });
    return;
  }
  res.json({ enquiry });
}));

app.get('/api/content/:section', asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  if (!isPublicCmsSection(section)) {
    res.status(404).json({ message: 'Unknown content section.' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json({ records: await listPublishedCmsRecords(section) });
}));
app.get('/api/content/:section/:slug', asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isPublicCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  const record = await findCmsRecord(section, slug);
  if (!record || record.status !== 'published' || !record.publishedContent) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    record: {
      id: record.id,
      section: record.section,
      slug: record.slug,
      status: record.status,
      content: record.publishedContent,
      updatedAt: record.publishedAt ?? record.updatedAt,
      publishedAt: record.publishedAt,
    },
  });
}));

app.get('/api/admin/content/:section', requireCmsPermission('read'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  if (!isCmsSection(section)) {
    res.status(404).json({ message: 'Unknown content section.' });
    return;
  }
  const status = req.query.status;
  if (status !== undefined && (typeof status !== 'string' || !cmsStatuses.includes(status as CmsStatus))) {
    res.status(400).json({ message: 'Invalid content status.' });
    return;
  }
  res.json({ records: await listCmsRecords(section, status as CmsStatus | undefined) });
}));
app.get('/api/admin/content/:section/:slug', requireCmsPermission('read'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  const record = await findCmsRecord(section, slug);
  if (!record) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  res.json({
    record,
    ...(section === 'courses' ? { structure: await getCourseStructure(record.id) } : {}),
  });
}));
app.post('/api/admin/content/:section', requireCmsPermission('create'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  if (!isCmsSection(section)) {
    res.status(404).json({ message: 'Unknown content section.' });
    return;
  }
  const rawContent = req.body?.content;
  const content = section === 'courses'
    ? validateCourseContent(rawContent)
    : readCmsContent(rawContent);
  const suppliedSlug = typeof req.body?.slug === 'string' ? req.body.slug : '';
  const slug = suppliedSlug || (section === 'courses' ? slugFromTitle(content?.title) : '');
  if (!validSlug(slug) || !content) {
    res.status(400).json({ message: !content
      ? section === 'courses' ? courseContentValidationMessage : contentValidationMessage
      : 'Slug must be 1–120 lowercase letters, numbers, hyphens, or underscores.' });
    return;
  }
  try {
    const record = await createCmsRecord(section, slug, content, {
      ...req.auth!,
      ipAddress: currentIpAddress(req),
    });
    res.status(201).json({ record });
  } catch (error) {
    if (error instanceof Error && error.message === 'CMS_SLUG_EXISTS') {
      res.status(409).json({ message: 'A record with this section and slug already exists.' });
      return;
    }
    throw error;
  }
}));
app.put('/api/admin/content/:section/:slug', requireCmsPermission('update'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  const content = section === 'courses'
    ? validateCourseContent(req.body?.content)
    : readCmsContent(req.body?.content);
  if (!content) {
    res.status(400).json({ message: section === 'courses' ? courseContentValidationMessage : contentValidationMessage });
    return;
  }
  const record = await updateCmsRecord(section, slug, content, {
    ...req.auth!,
    ipAddress: currentIpAddress(req),
  });
  if (!record) {
    res.status(404).json({ message: 'Content not found or is archived.' });
    return;
  }
  res.json({ record });
}));
app.post('/api/admin/content/:section/:slug/publish', requireCmsPermission('publish'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  if (section === 'courses') {
    const current = await findCmsRecord(section, slug);
    const content = current && validateCourseContent(current.content);
    if (!current || !content) {
      res.status(400).json({ message: 'Course content is invalid. Correct the course draft before publishing.' });
      return;
    }
    const publicationError = coursePublicationError(content);
    if (publicationError) {
      res.status(400).json({ message: publicationError });
      return;
    }
  }
  const record = await publishCmsRecord(section, slug, {
    ...req.auth!,
    ipAddress: currentIpAddress(req),
  });
  if (!record) {
    res.status(404).json({ message: 'Content not found or is archived.' });
    return;
  }
  res.json({ record });
}));
app.post('/api/admin/content/:section/:slug/unpublish', requireCmsPermission('publish'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  const record = await unpublishCmsRecord(section, slug, {
    ...req.auth!,
    ipAddress: currentIpAddress(req),
  });
  if (!record) {
    res.status(409).json({ message: 'Content is not currently published.' });
    return;
  }
  res.json({ record });
}));
app.post('/api/admin/content/:section/:slug/archive', requireCmsPermission('archive'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  const record = await archiveCmsRecord(section, slug, {
    ...req.auth!,
    ipAddress: currentIpAddress(req),
  });
  if (!record) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  res.json({ record });
}));
app.post('/api/admin/content/:section/:slug/restore', requireCmsPermission('archive'), asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  const record = await restoreCmsRecord(section, slug, {
    ...req.auth!,
    ipAddress: currentIpAddress(req),
  });
  if (!record) {
    res.status(404).json({ message: 'Content not found or is not archived.' });
    return;
  }
  res.json({ record });
}));
app.delete('/api/admin/content/:section/:slug', (req, res, next) => {
  if (req.auth?.role === 'ADMIN') return next();
  return requireCmsPermission('delete')(req, res, next);
}, asyncHandler(async (req, res) => {
  const section = routeParam(req.params.section);
  const slug = routeParam(req.params.slug);
  if (!isCmsSection(section) || !validSlug(slug)) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  if (!await deleteCmsRecord(section, slug, {
    ...req.auth!,
    ipAddress: currentIpAddress(req),
  })) {
    res.status(404).json({ message: 'Content not found.' });
    return;
  }
  res.status(204).end();
}));

// ── Serve the built frontend (single-origin production deploy) ────────────
// Resolves to <repo>/dist from server/dist/index.js (prod) or server/src (dev).
// Only activates when the frontend has been built, so local dev is unaffected.
const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: 'index.html', maxAge: '1h' }));
  // SPA fallback: any non-API GET request that wasn't matched serves index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error && typeof error === 'object' && 'type' in error) {
    const type = (error as { type?: unknown }).type;
    if (type === 'entity.too.large') {
      res.status(413).json({ message: 'Request body is too large.' });
      return;
    }
    if (type === 'entity.parse.failed') {
      res.status(400).json({ message: 'Request body must be valid JSON.' });
      return;
    }
  }
  console.error('[api] Request failed:', error);
  if (res.headersSent) return;
  res.status(500).json({ message: 'An internal server error occurred.' });
};
app.use(errorHandler);

// ── Serve front-end static assets in production ──────────────────────
const clientDistPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', '..', 'dist',          // server/dist/index.js → ../../dist
);
if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // SPA fallback: any non-API route serves index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log(`[static] Serving front-end from ${clientDistPath}`);
}

async function start(): Promise<void> {
  await initializeDatabase();
  const server = app.listen(config.port, () => {
    console.log(`Auth API listening on port ${config.port}`);
  });

  let shuttingDown = false;
  const shutdown = (): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(error => {
      if (error) {
        console.error('[shutdown] HTTP server failed to close cleanly:', error);
        process.exitCode = 1;
      }
      void closeDataDatabase().catch(databaseError => {
        console.error('[shutdown] Database connection failed to close cleanly:', databaseError);
        process.exitCode = 1;
      });
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

start().catch(async error => {
  console.error('[startup] Authentication service failed to start:', error);
  process.exitCode = 1;
});
