// ============================================================
// Global Minds Academy — ADMIN MOCK DATA
// Realistic placeholder data for admin UI demonstration.
// Replace with real API calls when backend is connected.
// ============================================================

export type StudentStatus = 'active' | 'inactive' | 'completed' | 'suspended' | 'trial';
export type EnquiryStatus = 'new' | 'contacted' | 'enrolled' | 'not-interested' | 'follow-up';
export type BatchStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type ActivityType = 'login' | 'lesson' | 'quiz' | 'assignment' | 'certificate' | 'enquiry' | 'enrollment' | 'payment' | 'download' | 'forum';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarColor: string;
  status: StudentStatus;
  enrolledCourses: string[];
  activeCourse: string;
  batchId: string;
  batchName: string;
  progress: number;          // 0-100
  attendance: number;        // 0-100
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  quizzesPassed: number;
  quizzesTotal: number;
  lastActive: string;
  joinedDate: string;
  location: string;
  source: 'organic' | 'referral' | 'google' | 'social' | 'direct';
  feePaid: number;
  feePending: number;
  certificateEarned: boolean;
  notes: string;
  activityLog: ActivityEntry[];
}

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  meta?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: EnquiryStatus;
  source: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  followUpDate?: string | null;
  notes: string;
}

export interface AdminBatch {
  id: string;
  name: string;
  course: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  schedule: string;
  time: string;
  mode: 'Online' | 'Classroom' | 'Hybrid';
  status: BatchStatus;
  capacity: number;
  enrolled: number;
  completed: number;
  avgProgress: number;
  avgAttendance: number;
  fee: number;
}

export interface SiteActivity {
  id: string;
  type: ActivityType;
  actor: string;
  actorRole: 'student' | 'admin' | 'instructor' | 'system';
  description: string;
  timestamp: string;
  ip?: string;
  module: string;
}

// ── Students ───────────────────────────────────────────────
export const mockStudents: Student[] = [
  {
    id: 'st1', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 98765 43210',
    avatar: 'PS', avatarColor: 'bg-brand-500', status: 'active',
    enrolledCourses: ['AWS Training', 'DevOps Training'],
    activeCourse: 'AWS Training', batchId: 'bt1', batchName: 'AWS Oct 2026 Weekday',
    progress: 72, attendance: 88, assignmentsSubmitted: 8, assignmentsTotal: 10,
    quizzesPassed: 5, quizzesTotal: 6, lastActive: '2026-10-06T09:15:00',
    joinedDate: '2026-09-01', location: 'Chennai', source: 'google',
    feePaid: 18999, feePending: 0, certificateEarned: false,
    notes: 'High performer, consistently submits work on time.',
    activityLog: [
      { id: 'a1', type: 'lesson', description: 'Completed Module 5: VPC Networking', timestamp: '2026-10-06T09:15:00', meta: 'AWS Training' },
      { id: 'a2', type: 'quiz', description: 'Passed Quiz: EC2 & Auto Scaling (9/10)', timestamp: '2026-10-05T18:30:00', meta: 'Score: 90%' },
      { id: 'a3', type: 'login', description: 'Student logged in', timestamp: '2026-10-05T18:00:00' },
      { id: 'a4', type: 'assignment', description: 'Submitted Assignment 8: S3 Bucket Policy', timestamp: '2026-10-04T21:10:00', meta: 'AWS Training' },
      { id: 'a5', type: 'lesson', description: 'Completed Module 4: Storage Services', timestamp: '2026-10-04T20:00:00', meta: 'AWS Training' },
      { id: 'a6', type: 'login', description: 'Student logged in', timestamp: '2026-10-04T19:45:00' },
    ],
  },
  {
    id: 'st2', name: 'Rahul Mehta', email: 'rahul.mehta@email.com', phone: '+91 87654 32109',
    avatar: 'RM', avatarColor: 'bg-accent-500', status: 'active',
    enrolledCourses: ['Full Stack Development'],
    activeCourse: 'Full Stack Development', batchId: 'bt2', batchName: 'Full Stack Oct 2026 Weekend',
    progress: 45, attendance: 75, assignmentsSubmitted: 5, assignmentsTotal: 10,
    quizzesPassed: 3, quizzesTotal: 5, lastActive: '2026-10-05T14:20:00',
    joinedDate: '2026-09-15', location: 'Hyderabad', source: 'referral',
    feePaid: 11499, feePending: 11500, certificateEarned: false,
    notes: 'Mid-course. Struggling with React hooks — flag for extra support.',
    activityLog: [
      { id: 'a1', type: 'lesson', description: 'Completed Module 3: React Hooks', timestamp: '2026-10-05T14:20:00', meta: 'Full Stack' },
      { id: 'a2', type: 'login', description: 'Student logged in', timestamp: '2026-10-05T13:55:00' },
      { id: 'a3', type: 'quiz', description: 'Failed Quiz: React State Management (5/10)', timestamp: '2026-10-03T16:00:00', meta: 'Score: 50%' },
      { id: 'a4', type: 'assignment', description: 'Submitted Assignment 5: Todo App in React', timestamp: '2026-10-02T22:30:00' },
    ],
  },
  {
    id: 'st3', name: 'Anjali Nair', email: 'anjali.nair@email.com', phone: '+91 76543 21098',
    avatar: 'AN', avatarColor: 'bg-green-500', status: 'completed',
    enrolledCourses: ['Data Science & AI', 'Python Training'],
    activeCourse: 'Data Science & AI', batchId: 'bt3', batchName: 'Data Science Sep 2026',
    progress: 100, attendance: 96, assignmentsSubmitted: 12, assignmentsTotal: 12,
    quizzesPassed: 8, quizzesTotal: 8, lastActive: '2026-10-01T11:00:00',
    joinedDate: '2026-07-10', location: 'Bangalore', source: 'organic',
    feePaid: 39999, feePending: 0, certificateEarned: true,
    notes: 'Course completed. Certificate issued. Placed at Google.',
    activityLog: [
      { id: 'a1', type: 'certificate', description: 'Certificate issued: Data Science & AI', timestamp: '2026-10-01T11:00:00' },
      { id: 'a2', type: 'lesson', description: 'Completed final module: Model Deployment', timestamp: '2026-09-30T15:00:00' },
      { id: 'a3', type: 'assignment', description: 'Submitted Capstone Project: Sentiment Analysis', timestamp: '2026-09-28T20:00:00', meta: 'Score: 95%' },
      { id: 'a4', type: 'quiz', description: 'Passed Final Assessment (48/50)', timestamp: '2026-09-25T14:00:00', meta: 'Score: 96%' },
    ],
  },
  {
    id: 'st4', name: 'Suresh Kumar', email: 'suresh.kumar@email.com', phone: '+91 65432 10987',
    avatar: 'SK', avatarColor: 'bg-purple-500', status: 'inactive',
    enrolledCourses: ['Software Testing'],
    activeCourse: 'Software Testing', batchId: 'bt4', batchName: 'Testing Oct 2026 Weekend',
    progress: 20, attendance: 40, assignmentsSubmitted: 2, assignmentsTotal: 10,
    quizzesPassed: 1, quizzesTotal: 4, lastActive: '2026-09-25T10:00:00',
    joinedDate: '2026-09-20', location: 'Mumbai', source: 'social',
    feePaid: 6499, feePending: 6500, certificateEarned: false,
    notes: 'Has not attended last 3 sessions. Follow-up needed.',
    activityLog: [
      { id: 'a1', type: 'login', description: 'Student logged in', timestamp: '2026-09-25T10:00:00' },
      { id: 'a2', type: 'lesson', description: 'Completed Module 2: Test Case Design', timestamp: '2026-09-25T10:30:00' },
      { id: 'a3', type: 'assignment', description: 'Submitted Assignment 2: Test Plan Draft', timestamp: '2026-09-24T18:00:00' },
    ],
  },
  {
    id: 'st5', name: 'Kavitha Reddy', email: 'kavitha.reddy@email.com', phone: '+91 54321 09876',
    avatar: 'KR', avatarColor: 'bg-orange-500', status: 'active',
    enrolledCourses: ['Python Training', 'Django Training'],
    activeCourse: 'Python Training', batchId: 'bt5', batchName: 'Python Oct 2026 Weekday',
    progress: 60, attendance: 92, assignmentsSubmitted: 7, assignmentsTotal: 10,
    quizzesPassed: 4, quizzesTotal: 5, lastActive: '2026-10-06T08:00:00',
    joinedDate: '2026-09-08', location: 'Chennai', source: 'google',
    feePaid: 14999, feePending: 0, certificateEarned: false,
    notes: 'Strong student, interested in data career track.',
    activityLog: [
      { id: 'a1', type: 'login', description: 'Student logged in', timestamp: '2026-10-06T08:00:00' },
      { id: 'a2', type: 'lesson', description: 'Completed Module 6: OOP in Python', timestamp: '2026-10-06T08:45:00' },
      { id: 'a3', type: 'quiz', description: 'Passed Quiz: Functions & Modules (8/10)', timestamp: '2026-10-04T19:00:00', meta: 'Score: 80%' },
      { id: 'a4', type: 'download', description: 'Downloaded course materials: Module 5', timestamp: '2026-10-03T17:30:00' },
    ],
  },
  {
    id: 'st6', name: 'Arjun Singh', email: 'arjun.singh@email.com', phone: '+91 43210 98765',
    avatar: 'AS', avatarColor: 'bg-sky-500', status: 'active',
    enrolledCourses: ['Cyber Security Training'],
    activeCourse: 'Cyber Security Training', batchId: 'bt6', batchName: 'Cyber Security Oct 2026',
    progress: 35, attendance: 85, assignmentsSubmitted: 4, assignmentsTotal: 10,
    quizzesPassed: 2, quizzesTotal: 4, lastActive: '2026-10-05T20:00:00',
    joinedDate: '2026-09-25', location: 'Pune', source: 'direct',
    feePaid: 24999, feePending: 0, certificateEarned: false,
    notes: 'Very engaged in class. Good practical skills.',
    activityLog: [
      { id: 'a1', type: 'lesson', description: 'Completed Module 3: Network Scanning', timestamp: '2026-10-05T20:00:00' },
      { id: 'a2', type: 'login', description: 'Student logged in', timestamp: '2026-10-05T19:30:00' },
      { id: 'a3', type: 'quiz', description: 'Passed Quiz: Network Security Basics (7/10)', timestamp: '2026-10-03T20:00:00' },
      { id: 'a4', type: 'assignment', description: 'Submitted Lab Report: Nmap Scan', timestamp: '2026-10-02T21:00:00' },
    ],
  },
  {
    id: 'st7', name: 'Meena Pillai', email: 'meena.pillai@email.com', phone: '+91 32109 87654',
    avatar: 'MP', avatarColor: 'bg-teal-500', status: 'trial',
    enrolledCourses: [],
    activeCourse: 'DevOps Training (Demo)', batchId: '', batchName: 'Demo Session',
    progress: 0, attendance: 100, assignmentsSubmitted: 0, assignmentsTotal: 0,
    quizzesPassed: 0, quizzesTotal: 0, lastActive: '2026-10-06T10:00:00',
    joinedDate: '2026-10-06', location: 'Bangalore', source: 'google',
    feePaid: 0, feePending: 0, certificateEarned: false,
    notes: 'Attended free demo. Follow up for enrollment.',
    activityLog: [
      { id: 'a1', type: 'login', description: 'Attended free demo class', timestamp: '2026-10-06T10:00:00' },
      { id: 'a2', type: 'enquiry', description: 'Submitted enquiry for DevOps Training', timestamp: '2026-10-05T15:00:00' },
    ],
  },
  {
    id: 'st8', name: 'Vikram Sharma', email: 'vikram.sharma@email.com', phone: '+91 21098 76543',
    avatar: 'VS', avatarColor: 'bg-red-500', status: 'active',
    enrolledCourses: ['Machine Learning', 'Generative AI'],
    activeCourse: 'Machine Learning', batchId: 'bt7', batchName: 'ML Oct 2026 Weekend',
    progress: 55, attendance: 82, assignmentsSubmitted: 6, assignmentsTotal: 10,
    quizzesPassed: 4, quizzesTotal: 6, lastActive: '2026-10-06T07:30:00',
    joinedDate: '2026-09-12', location: 'Delhi', source: 'referral',
    feePaid: 27999, feePending: 0, certificateEarned: false,
    notes: 'Working professional, attends weekend batches.',
    activityLog: [
      { id: 'a1', type: 'lesson', description: 'Completed Module 4: Classification Algorithms', timestamp: '2026-10-06T07:30:00' },
      { id: 'a2', type: 'quiz', description: 'Passed Quiz: Supervised Learning (7/10)', timestamp: '2026-10-04T09:00:00' },
      { id: 'a3', type: 'assignment', description: 'Submitted Assignment 6: Logistic Regression Model', timestamp: '2026-10-03T20:00:00' },
    ],
  },
];

// ── Enquiries ──────────────────────────────────────────────
export const mockEnquiries: Enquiry[] = [
  { id: 'eq1', name: 'Deepa Krishnan', email: 'deepa.k@email.com', phone: '+91 99887 76655', course: 'DevOps Training', message: 'I am a 2-year experienced developer looking to transition into DevOps. Is this course suitable for me?', status: 'new', source: 'Website Form', assignedTo: 'Counsellor A', createdAt: '2026-10-06T08:30:00', updatedAt: '2026-10-06T08:30:00', notes: '' },
  { id: 'eq2', name: 'Ramesh Babu', email: 'ramesh.b@email.com', phone: '+91 88776 65544', course: 'AWS Training', message: 'What is the batch timing for the weekend AWS batch? I am working professional.', status: 'contacted', source: 'WhatsApp', assignedTo: 'Counsellor B', createdAt: '2026-10-05T14:00:00', updatedAt: '2026-10-06T09:00:00', followUpDate: '2026-10-08', notes: 'Called on Oct 6 — interested in weekend batch. Needs EMI option.' },
  { id: 'eq3', name: 'Lakshmi Priya', email: 'lakshmi.p@email.com', phone: '+91 77665 54433', course: 'Data Science & AI', message: 'I am a non-IT background student. Can I join the Data Science course?', status: 'enrolled', source: 'Google Ad', assignedTo: 'Counsellor A', createdAt: '2026-10-04T10:00:00', updatedAt: '2026-10-06T11:00:00', notes: 'Enrolled in the Oct 22 batch. Fee paid in full.' },
  { id: 'eq4', name: 'Naveen Kumar', email: 'naveen.k@email.com', phone: '+91 66554 43322', course: 'Full Stack Development', message: 'Do you provide job guarantee after this course?', status: 'follow-up', source: 'Instagram', assignedTo: 'Counsellor C', createdAt: '2026-10-03T16:30:00', updatedAt: '2026-10-05T10:00:00', followUpDate: '2026-10-07', notes: 'Clarified no guarantee policy. Interested but wants to think. Follow up on Oct 7.' },
  { id: 'eq5', name: 'Santosh Rao', email: 'santosh.r@email.com', phone: '+91 55443 32211', course: 'Cyber Security Training', message: 'What certifications will I receive after completing this course?', status: 'contacted', source: 'LinkedIn', assignedTo: 'Counsellor B', createdAt: '2026-10-03T09:00:00', updatedAt: '2026-10-04T14:00:00', notes: 'Sent certification details via email.' },
  { id: 'eq6', name: 'Pooja Iyer', email: 'pooja.i@email.com', phone: '+91 44332 21100', course: 'Python Training', message: 'Hi, I am a final year student. Do you offer any student discounts?', status: 'new', source: 'Website Form', assignedTo: '', createdAt: '2026-10-06T11:00:00', updatedAt: '2026-10-06T11:00:00', notes: '' },
  { id: 'eq7', name: 'Kiran Babu', email: 'kiran.b@email.com', phone: '+91 33221 10099', course: 'Salesforce Training', message: 'I have 5 years experience in Java. How long will Salesforce training take for me?', status: 'not-interested', source: 'Direct', assignedTo: 'Counsellor A', createdAt: '2026-10-02T15:00:00', updatedAt: '2026-10-03T11:00:00', notes: 'Decided to go with a different institute.' },
  { id: 'eq8', name: 'Ananya Krishnamurthy', email: 'ananya.k@email.com', phone: '+91 22110 09988', course: 'Microsoft Azure', message: 'I already have AWS certification. What Azure certifications can I target?', status: 'new', source: 'Referral', assignedTo: '', createdAt: '2026-10-06T12:00:00', updatedAt: '2026-10-06T12:00:00', notes: '' },
];

// ── Batches ────────────────────────────────────────────────
export const mockBatches: AdminBatch[] = [
  { id: 'bt1', name: 'AWS Oct 2026 Weekday', course: 'AWS Training', category: 'Cloud', instructor: 'Rajesh Kumar', startDate: '2026-10-15', endDate: '2026-12-15', schedule: 'Mon / Wed / Fri', time: '7:00 AM – 9:00 AM', mode: 'Online', status: 'upcoming', capacity: 25, enrolled: 18, completed: 0, avgProgress: 0, avgAttendance: 0, fee: 18999 },
  { id: 'bt2', name: 'Full Stack Oct 2026 Weekend', course: 'Full Stack Development', category: 'Full Stack', instructor: 'Priya Nair', startDate: '2026-10-18', endDate: '2027-01-18', schedule: 'Sat / Sun', time: '10:00 AM – 1:00 PM', mode: 'Hybrid', status: 'upcoming', capacity: 20, enrolled: 14, completed: 0, avgProgress: 0, avgAttendance: 0, fee: 22999 },
  { id: 'bt3', name: 'Data Science Sep 2026', course: 'Data Science & AI', category: 'AI / ML', instructor: 'Anitha Reddy', startDate: '2026-09-01', endDate: '2026-11-30', schedule: 'Mon / Wed / Fri', time: '8:00 AM – 10:00 AM', mode: 'Online', status: 'ongoing', capacity: 20, enrolled: 19, completed: 4, avgProgress: 68, avgAttendance: 87, fee: 24999 },
  { id: 'bt4', name: 'Testing Oct 2026 Weekend', course: 'Software Testing', category: 'QA', instructor: 'Kiran Babu', startDate: '2026-10-04', endDate: '2026-12-01', schedule: 'Sat / Sun', time: '2:00 PM – 5:00 PM', mode: 'Online', status: 'ongoing', capacity: 25, enrolled: 22, completed: 0, avgProgress: 24, avgAttendance: 71, fee: 12999 },
  { id: 'bt5', name: 'Python Oct 2026 Weekday', course: 'Python Training', category: 'Programming', instructor: 'Arjun Singh', startDate: '2026-10-08', endDate: '2026-11-25', schedule: 'Mon / Wed / Fri', time: '7:00 PM – 9:00 PM', mode: 'Online', status: 'ongoing', capacity: 25, enrolled: 21, completed: 0, avgProgress: 42, avgAttendance: 89, fee: 9999 },
  { id: 'bt6', name: 'Cyber Security Oct 2026', course: 'Cyber Security Training', category: 'Security', instructor: 'Venkat Rao', startDate: '2026-10-01', endDate: '2026-12-15', schedule: 'Tue / Thu', time: '6:00 PM – 8:00 PM', mode: 'Hybrid', status: 'ongoing', capacity: 20, enrolled: 16, completed: 0, avgProgress: 31, avgAttendance: 84, fee: 15999 },
  { id: 'bt7', name: 'ML Oct 2026 Weekend', course: 'Machine Learning', category: 'AI / ML', instructor: 'Deepa Krishnan', startDate: '2026-10-05', endDate: '2027-01-05', schedule: 'Sat / Sun', time: '11:00 AM – 2:00 PM', mode: 'Online', status: 'ongoing', capacity: 20, enrolled: 17, completed: 0, avgProgress: 38, avgAttendance: 80, fee: 19999 },
  { id: 'bt8', name: 'DevOps Aug 2026 Fast-Track', course: 'DevOps Training', category: 'DevOps', instructor: 'Suresh Anand', startDate: '2026-08-01', endDate: '2026-09-30', schedule: 'Mon – Fri', time: '10:00 AM – 4:00 PM', mode: 'Classroom', status: 'completed', capacity: 15, enrolled: 15, completed: 13, avgProgress: 100, avgAttendance: 91, fee: 16999 },
];

// ── Site Activity Log ──────────────────────────────────────
export const mockSiteActivity: SiteActivity[] = [
  { id: 'sa1', type: 'login', actor: 'Priya Sharma', actorRole: 'student', description: 'Student logged in from Chennai', timestamp: '2026-10-06T09:15:00', ip: '103.21.x.x', module: 'Auth' },
  { id: 'sa2', type: 'enquiry', actor: 'Pooja Iyer', actorRole: 'student', description: 'New enquiry submitted for Python Training', timestamp: '2026-10-06T11:00:00', module: 'Enquiries' },
  { id: 'sa3', type: 'enrollment', actor: 'Kavitha Reddy', actorRole: 'student', description: 'Enrolled in Python Training — Oct Weekday Batch', timestamp: '2026-10-06T10:30:00', module: 'Enrollments' },
  { id: 'sa4', type: 'payment', actor: 'Vikram Sharma', actorRole: 'student', description: 'Payment received ₹27,999 for Machine Learning', timestamp: '2026-10-06T08:00:00', module: 'Payments' },
  { id: 'sa5', type: 'lesson', actor: 'Priya Sharma', actorRole: 'student', description: 'Completed Module 5: VPC Networking (AWS Training)', timestamp: '2026-10-06T09:15:00', module: 'Learning' },
  { id: 'sa6', type: 'quiz', actor: 'Priya Sharma', actorRole: 'student', description: 'Passed EC2 & Auto Scaling quiz — Score: 90%', timestamp: '2026-10-05T18:30:00', module: 'Assessments' },
  { id: 'sa7', type: 'enquiry', actor: 'Ananya Krishnamurthy', actorRole: 'student', description: 'New enquiry submitted for Microsoft Azure', timestamp: '2026-10-06T12:00:00', module: 'Enquiries' },
  { id: 'sa8', type: 'login', actor: 'Admin User', actorRole: 'admin', description: 'Admin logged in', timestamp: '2026-10-06T08:00:00', ip: '192.168.x.x', module: 'Auth' },
  { id: 'sa9', type: 'certificate', actor: 'System', actorRole: 'system', description: 'Certificate generated for Anjali Nair — Data Science & AI', timestamp: '2026-10-01T11:00:00', module: 'Certificates' },
  { id: 'sa10', type: 'enrollment', actor: 'Lakshmi Priya', actorRole: 'student', description: 'Enrolled in Data Science Oct Batch — fee paid', timestamp: '2026-10-04T15:00:00', module: 'Enrollments' },
  { id: 'sa11', type: 'assignment', actor: 'Rahul Mehta', actorRole: 'student', description: 'Submitted Assignment 5: Todo App in React', timestamp: '2026-10-02T22:30:00', module: 'Assessments' },
  { id: 'sa12', type: 'payment', actor: 'Rahul Mehta', actorRole: 'student', description: 'Partial payment received ₹11,499 for Full Stack Development', timestamp: '2026-09-15T10:00:00', module: 'Payments' },
  { id: 'sa13', type: 'login', actor: 'Kavitha Reddy', actorRole: 'student', description: 'Student logged in from Chennai', timestamp: '2026-10-06T08:00:00', ip: '103.22.x.x', module: 'Auth' },
  { id: 'sa14', type: 'forum', actor: 'Arjun Singh', actorRole: 'student', description: 'Posted question in Cyber Security forum', timestamp: '2026-10-05T21:00:00', module: 'Community' },
  { id: 'sa15', type: 'download', actor: 'Kavitha Reddy', actorRole: 'student', description: 'Downloaded course materials: Module 5 notes', timestamp: '2026-10-03T17:30:00', module: 'Resources' },
  { id: 'sa16', type: 'quiz', actor: 'Arjun Singh', actorRole: 'student', description: 'Passed Network Security Basics quiz — Score: 70%', timestamp: '2026-10-03T20:00:00', module: 'Assessments' },
  { id: 'sa17', type: 'lesson', actor: 'Kavitha Reddy', actorRole: 'student', description: 'Completed Module 6: OOP in Python', timestamp: '2026-10-06T08:45:00', module: 'Learning' },
  { id: 'sa18', type: 'enquiry', actor: 'Deepa Krishnan', actorRole: 'student', description: 'New enquiry submitted for DevOps Training', timestamp: '2026-10-06T08:30:00', module: 'Enquiries' },
  { id: 'sa19', type: 'enrollment', actor: 'Arjun Singh', actorRole: 'student', description: 'Enrolled in Cyber Security Oct Batch', timestamp: '2026-09-25T12:00:00', module: 'Enrollments' },
  { id: 'sa20', type: 'payment', actor: 'Arjun Singh', actorRole: 'student', description: 'Full payment received ₹24,999 for Cyber Security', timestamp: '2026-09-25T12:30:00', module: 'Payments' },
];

// ── Dashboard KPIs ─────────────────────────────────────────
export const dashboardKPIs = {
  totalStudents: 8,
  activeStudents: 5,
  newThisMonth: 6,
  completedThisMonth: 1,
  totalRevenue: 162992,
  revenueThisMonth: 72997,
  pendingFees: 24500,
  totalEnquiries: 8,
  newEnquiries: 3,
  conversionRate: 37.5,
  avgProgress: 52,
  avgAttendance: 83,
  certificatesIssued: 1,
  activeBatches: 6,
};

// Enrollment trend (last 6 months)
export const enrollmentTrend = [
  { month: 'May', enrollments: 12, revenue: 218000 },
  { month: 'Jun', enrollments: 18, revenue: 312000 },
  { month: 'Jul', enrollments: 15, revenue: 267000 },
  { month: 'Aug', enrollments: 22, revenue: 398000 },
  { month: 'Sep', enrollments: 28, revenue: 486000 },
  { month: 'Oct', enrollments: 34, revenue: 612000 },
];

// Top courses by enrollment
export const topCourses = [
  { course: 'Full Stack Development', enrollments: 145, revenue: 3334855, completion: 68 },
  { course: 'AWS Training', enrollments: 128, revenue: 2431872, completion: 72 },
  { course: 'Data Science & AI', enrollments: 112, revenue: 2799888, completion: 61 },
  { course: 'Python Training', enrollments: 98, revenue: 979902, completion: 79 },
  { course: 'DevOps Training', enrollments: 87, revenue: 1478913, completion: 65 },
  { course: 'Software Testing', enrollments: 76, revenue: 988724, completion: 82 },
];
