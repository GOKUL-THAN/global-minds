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

const defaultStudentPortalData: StudentPortalData = {
  profile: {
    id: 'demo-student-1',
    email: 'student@globalminds.com',
    firstName: 'Alex',
    lastName: 'Kumar',
    phone: '+91 95974 37333',
    country: 'India',
    city: 'Chennai',
    education: "Bachelor's Degree in Computer Science",
    experience: '0-1 years',
    interestedCourse: 'AWS / Cloud Architect',
    learningMode: 'Online Interactive',
    careerGoal: 'Cloud Solutions Architect',
    createdAt: new Date().toISOString(),
  },
  courses: [
    {
      id: 'course-1',
      slug: 'aws-cloud-architect',
      title: 'AWS / Cloud Architect Master Program',
      shortDescription: 'Comprehensive hands-on training with real cloud workloads and AWS certification prep.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop',
      status: 'In Progress (68%)',
      enrolledAt: '2026-09-15',
    },
    {
      id: 'course-2',
      slug: 'full-stack-web-developer',
      title: 'Full Stack Web Development (MERN)',
      shortDescription: 'Modern frontend with React, backend Node.js APIs, and database engineering.',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=350&fit=crop',
      status: 'Enrolled',
      enrolledAt: '2026-10-01',
    },
  ],
  batches: [
    {
      id: 'batch-1',
      name: 'AWS Cloud Weekend Cohort 24',
      code: 'AWS-2026-W24',
      description: 'Live interactive weekend training with industry mentors.',
      startDate: '2026-10-15',
      endDate: '2026-12-20',
      schedule: { days: ['Saturday', 'Sunday'], time: '09:00 AM - 12:00 PM IST' },
      status: 'active',
    },
  ],
  attendance: [
    { id: 'att-1', attendanceDate: '2026-10-25', status: 'present', notes: 'Active participation in VPC hands-on', batchName: 'AWS Cloud Weekend Cohort 24' },
    { id: 'att-2', attendanceDate: '2026-10-26', status: 'present', notes: 'Completed EC2 auto-scaling lab', batchName: 'AWS Cloud Weekend Cohort 24' },
  ],
  attendanceTotal: 12,
  internships: [
    {
      id: 'intern-1',
      title: 'Cloud DevOps Engineering Intern',
      company: 'Global Minds TechLabs',
      description: 'Infrastructure automation and CI/CD pipeline deployments using Docker and GitHub Actions.',
      status: 'Active',
      progress: 60,
      appliedAt: '2026-10-05',
      updatedAt: '2026-10-27',
      startDate: '2026-10-15',
      endDate: '2026-12-31',
      supervisorName: 'Karthik Raja (Senior DevOps Lead)',
      notes: 'Mid-term milestone achieved successfully',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      certificateId: 'GMA-2026-AWS-84920',
      courseName: 'AWS Certified Solutions Architect Associate Prep',
      issuedAt: '2026-10-20',
      status: 'active',
    },
  ],
  activity: [
    { id: 'act-1', action: 'Completed Lab', resourceType: 'Lab', resourceId: 'lab-vpc-peering', metadata: 'VPC Peering & Route Tables', createdAt: new Date().toISOString() },
    { id: 'act-2', action: 'Submitted Assignment', resourceType: 'Assignment', resourceId: 'asg-3', metadata: 'Multi-AZ High Availability Architecture', createdAt: new Date().toISOString() },
  ],
  announcements: [
    { id: 'ann-1', title: 'Upcoming Capstone Project Submission', body: 'The Phase 1 Cloud Architecture blueprint is due this Friday by 6 PM IST.', publishedAt: '2026-10-28' },
    { id: 'ann-2', title: 'Guest Lecture by AWS Solutions Architect', body: 'Join us this Sunday at 11 AM IST for an interactive session on Serverless Microservices.', publishedAt: '2026-10-27' },
  ],
};

export const studentPortalService = {
  async getDashboard(): Promise<StudentPortalData> {
    try {
      const response = await fetch('/api/student/dashboard', { credentials: 'same-origin' });
      if (response.ok) {
        return await readData<StudentPortalData>(response);
      }
    } catch {
      // Backend offline
    }
    return defaultStudentPortalData;
  },

  async updateProfile(profile: Partial<Pick<StudentProfile, 'firstName' | 'lastName' | 'phone' | 'country' | 'city' | 'education' | 'experience' | 'careerGoal'>>): Promise<StudentProfile> {
    const payload: Record<string, string> = {};
    if (profile.firstName !== undefined || profile.lastName !== undefined) {
      payload.fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    }
    for (const field of ['phone', 'country', 'city', 'education', 'experience', 'careerGoal'] as const) {
      if (profile[field] !== undefined) payload[field] = profile[field] ?? '';
    }
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const result = await readData<{ profile: StudentProfile }>(response);
        return result.profile;
      }
    } catch {
      // Backend offline
    }
    return {
      ...defaultStudentPortalData.profile,
      ...profile,
    };
  },
};
