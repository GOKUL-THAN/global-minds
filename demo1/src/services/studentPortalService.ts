export interface StudentProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  education: string;
  experience: string;
  interestedCourse: string;
  learningMode: string;
  careerGoal: string;
  createdAt: string;
}

export interface StudentPortalData {
  profile: StudentProfile;
  courses: Array<{ id: string; slug: string; title: string; shortDescription: string; thumbnail: string; status: string; enrolledAt: string }>;
  batches: Array<{ id: string; name: string; code: string; description: string; startDate: string | null; endDate: string | null; schedule: unknown; status: string }>;
  attendance: Array<{ id: string; attendanceDate: string; status: string; notes: string; batchName: string }>;
  attendanceTotal: number;
  internships: Array<{ id: string; status: string; progress: number; appliedAt: string; updatedAt: string; notes: string; title: string; company: string; description: string; startDate: string | null; endDate: string | null; supervisorName: string | null }>;
  certificates: Array<{ id: string; certificateId: string; courseName: string; issuedAt: string; status: string }>;
  activity: Array<{ id: string; action: string; resourceType: string; resourceId: string | null; metadata: string; createdAt: string }>;
  announcements: Array<{ id: string; title: string; body: string; publishedAt: string }>;
}

async function readData<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => undefined) as {
    success?: boolean;
    data?: T;
    message?: string;
    error?: { message?: string };
  } | undefined;
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.error?.message ?? result?.message ?? `Student portal request failed (${response.status}).`);
  }
  return result.data;
}

export const studentPortalService = {
  async getDashboard(): Promise<StudentPortalData> {
    let response: Response;
    try {
      response = await fetch('/api/student/dashboard', { credentials: 'same-origin' });
    } catch {
      throw new Error('The student portal API is unavailable. Check your connection and try again.');
    }
    return readData<StudentPortalData>(response);
  },

  async updateProfile(profile: Partial<Pick<StudentProfile, 'firstName' | 'lastName' | 'phone' | 'country' | 'city' | 'education' | 'experience' | 'careerGoal'>>): Promise<StudentProfile> {
    const payload: Record<string, string> = {};
    if (profile.firstName !== undefined || profile.lastName !== undefined) {
      payload.fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    }
    for (const field of ['phone', 'country', 'city', 'education', 'experience', 'careerGoal'] as const) {
      if (profile[field] !== undefined) payload[field] = profile[field] ?? '';
    }
    let response: Response;
    try {
      response = await fetch('/api/student/profile', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('The student portal API is unavailable. Check your connection and try again.');
    }
    const result = await readData<{ profile: StudentProfile }>(response);
    return result.profile;
  },
};
