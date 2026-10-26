import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const jwtSecret = required('JWT_SECRET');
if (Buffer.byteLength(jwtSecret) < 32) {
  throw new Error('JWT_SECRET must contain at least 32 bytes.');
}

function configuredAccount(prefix: 'ADMIN' | 'SUPER_ADMIN') {
  const email = required(`${prefix}_EMAIL`).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`${prefix}_EMAIL must be a valid email address.`);
  }
  const password = required(`${prefix}_PASSWORD`);
  if (Buffer.byteLength(password) < 14 || Buffer.byteLength(password) > 72) {
    throw new Error(`${prefix}_PASSWORD must be 14–72 bytes long.`);
  }
  return { email, password, role: prefix };
}

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const databaseDriver = process.env.DATABASE_DRIVER?.trim().toLowerCase() ?? 'sqlite';
if (databaseDriver !== 'sqlite' && databaseDriver !== 'postgres') {
  throw new Error('DATABASE_DRIVER must be either "sqlite" or "postgres".');
}
if (process.env.NODE_ENV === 'production' && databaseDriver !== 'postgres') {
  throw new Error('Production deployments must use DATABASE_DRIVER=postgres.');
}
const databaseUrl = process.env.DATABASE_URL?.trim();
if (databaseDriver === 'postgres' && !databaseUrl) {
  throw new Error('DATABASE_URL is required when DATABASE_DRIVER=postgres.');
}
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const emailFrom = process.env.EMAIL_FROM?.trim();
if (Boolean(resendApiKey) !== Boolean(emailFrom)) {
  throw new Error('RESEND_API_KEY and EMAIL_FROM must be configured together.');
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  appOrigin: required('APP_ORIGIN'),
  databaseDriver,
  databaseUrl,
  databasePath: path.resolve(serverDirectory, process.env.DATABASE_PATH ?? 'data/admin.sqlite'),
  jwtSecret,
  resendApiKey,
  emailFrom,
  emailConfigured: Boolean(resendApiKey && emailFrom),
  verificationTokenTtlMinutes: 60,
  passwordResetTokenTtlMinutes: 30,
  sessionDurationSeconds: 2 * 60 * 60,
  accounts: [
    configuredAccount('ADMIN'),
    configuredAccount('SUPER_ADMIN'),
  ],
  isProduction: process.env.NODE_ENV === 'production',
};
