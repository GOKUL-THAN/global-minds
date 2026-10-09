import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
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

app.use('/api/admin', requireSameOriginForMutations, authenticate);
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
  if (!Number.isInteger(page) || page < 1
    || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid audit log pagination.' } });
    return;
  }
  res.json({ success: true, data: await listAuditLogs({ page, pageSize }) });
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
app.delete('/api/admin/content/:section/:slug', requireCmsPermission('delete'), asyncHandler(async (req, res) => {
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
