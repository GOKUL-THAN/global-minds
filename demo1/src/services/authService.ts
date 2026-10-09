import type { User } from '../types';

interface LoginCredentials { email: string; password: string; }
interface RegisterData {
  fullName: string; email: string; phone: string; password: string;
  country: string; city: string; education?: string; experience?: string;
  interestedCourse?: string; mode?: string; careerGoal?: string;
  consent: boolean;
}
interface AuthResponse { success: boolean; user?: User; code?: string; message: string; }

interface ApiResult {
  success?: boolean;
  message?: string;
  code?: string;
  error?: { code?: string; message?: string };
  data?: unknown;
}

async function readApiResult(response: Response): Promise<ApiResult> {
  return await response.json() as ApiResult;
}

function apiError(result: ApiResult, fallback: string): string {
  return result.error?.message ?? result.message ?? fallback;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(credentials),
    });
    const result = await readApiResult(response) as ApiResult & {
      user?: Partial<User> & Pick<User, 'id' | 'email' | 'role'>;
    };

    if (!response.ok || !result.success || !result.user) {
      return {
        success: false,
        code: result.error?.code ?? result.code,
        message: apiError(result, 'Unable to sign in.'),
      };
    }

    const user = this.mapUser(result.user);
    return { success: true, user, message: 'Login successful.' };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    const result = await readApiResult(response);
    if (!response.ok || !result.success) {
      return { success: false, message: apiError(result, 'Unable to create your account.') };
    }
    return { success: true, message: result.message ?? 'Your account was created.' };
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return this.postMessage('/api/auth/verify-email', { token: token.trim() }, 'Unable to verify your email.');
  }

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    return this.postMessage('/api/auth/resend-verification', { email: email.trim() }, 'Unable to resend the verification email.');
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    return this.postMessage('/api/auth/reset-password', { token: token.trim(), password }, 'Unable to reset your password.');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.postMessage('/api/auth/change-password', { currentPassword, newPassword }, 'Unable to change your password.');
  }

  async getSessions(): Promise<Array<{
    id: string;
    user_agent: string;
    ip_address: string;
    created_at: string;
    last_seen_at: string;
    expires_at: string;
  }>> {
    const response = await fetch('/api/auth/sessions', { credentials: 'same-origin' });
    const result = await readApiResult(response);
    if (!response.ok || !Array.isArray(result.data)) {
      throw new Error(apiError(result, 'Unable to load your sessions.'));
    }
    return result.data as Array<{
      id: string;
      user_agent: string;
      ip_address: string;
      created_at: string;
      last_seen_at: string;
      expires_at: string;
    }>;
  }

  async revokeSession(id: string): Promise<void> {
    const response = await fetch(`/api/auth/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (!response.ok) {
      const result = await readApiResult(response);
      throw new Error(apiError(result, 'Unable to revoke this session.'));
    }
  }

  async logoutAll(): Promise<void> {
    const response = await fetch('/api/auth/logout-all', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!response.ok) {
      const result = await readApiResult(response);
      throw new Error(apiError(result, 'Unable to sign out other sessions.'));
    }
  }

  async logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Unable to sign out.');
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error('Unable to verify your session.');

    const result = await readApiResult(response) as ApiResult & {
      user: Partial<User> & Pick<User, 'id' | 'email' | 'role'>;
    };
    return this.mapUser(result.user);
  }

  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    void phone;
    return { success: false, message: 'Phone verification is not available. Use email verification instead.' };
  }

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    void phone;
    void otp;
    return { success: false, message: 'Phone verification is not available. Use email verification instead.' };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.postMessage('/api/auth/forgot-password', { email }, 'Unable to request a password reset.');
  }

  private async postMessage(
    url: string,
    body: Record<string, string>,
    fallback: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
    const result = await readApiResult(response);
    if (!response.ok || !result.success) {
      return { success: false, message: apiError(result, fallback) };
    }
    const dataMessage = result.data && typeof result.data === 'object' && 'message' in result.data
      && typeof result.data.message === 'string'
      ? result.data.message
      : undefined;
    return { success: true, message: dataMessage ?? result.message ?? 'Request completed.' };
  }

  private mapUser(user: Partial<User> & Pick<User, 'id' | 'email' | 'role'>): User {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName ?? user.email,
      phone: user.phone ?? '',
      country: user.country ?? '',
      city: user.city ?? '',
      education: user.education,
      experience: user.experience,
      createdAt: user.createdAt ?? new Date().toISOString(),
      isActive: user.isActive ?? true,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      permissions: user.permissions ?? [],
      enrolledCourses: user.enrolledCourses ?? [],
    };
  }
}

export const authService = new AuthService();
