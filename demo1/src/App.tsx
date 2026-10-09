import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminAuthGate } from './components/admin/AdminAuthGate';

// ── Public pages ────────────────────────────────────────────
import HomePage from './pages/HomePage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import CategoryPage from './pages/CategoryPage';
import MasterProgramsPage from './pages/master-programs/MasterProgramsPage';
import MasterProgramDetailPage from './pages/master-programs/MasterProgramDetailPage';
import OnlineTrainingPage from './pages/OnlineTrainingPage';
import ClassroomTrainingPage from './pages/ClassroomTrainingPage';
import CertificationsPage from './pages/CertificationsPage';
import CareerPage from './pages/career/CareerPage';
import JobSupportPage from './pages/career/JobSupportPage';
import InterviewPrepPage from './pages/career/InterviewPrepPage';
import ResumePrepPage from './pages/career/ResumePrepPage';
import MockInterviewPage from './pages/career/MockInterviewPage';
import InternshipsPage from './pages/InternshipsPage';
import InternshipDetailPage from './pages/internships/InternshipDetailPage';
import CorporateTrainingPage from './pages/CorporateTrainingPage';
import CollegesPage from './pages/CollegesPage';
import TrainersPage from './pages/TrainersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/blog/BlogPage';
import BlogDetailPage from './pages/blog/BlogDetailPage';
import LocationsPage from './pages/locations/LocationsPage';
import LocationDetailPage from './pages/locations/LocationDetailPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import RefundPolicyPage from './pages/legal/RefundPolicyPage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';
import NotFoundPage from './pages/NotFoundPage';

// ── New feature pages ────────────────────────────────────────
import PlacementPage from './pages/PlacementPage';
import BatchSchedulePage from './pages/BatchSchedulePage';
import DemoClassPage from './pages/DemoClassPage';
import SkillAssessmentPage from './pages/SkillAssessmentPage';
import ScholarshipPage from './pages/ScholarshipPage';
import EventsPage from './pages/EventsPage';
import LiveProjectsPage from './pages/LiveProjectsPage';
import ReferEarnPage from './pages/ReferEarnPage';

// ── Auth pages (no shared layout) ──────────────────────────
import LoginPage from './pages/auth/LoginPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/auth/AccountRecoveryPages';
import AccountSecurityPage from './pages/auth/AccountSecurityPage';

// ── Dashboard (no shared layout) ───────────────────────────
import StudentDashboardPage from './pages/dashboard/StudentDashboardPage';

// ── Admin pages ─────────────────────────────────────────────
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminMasterProgramsPage from './pages/admin/AdminMasterProgramsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminStudentDetailPage from './pages/admin/AdminStudentDetailPage';
import AdminStudentProgressPage from './pages/admin/AdminStudentProgressPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminInstructorsPage from './pages/admin/AdminInstructorsPage';
import AdminEnquiriesPage from './pages/admin/AdminEnquiriesPage';
import AdminInternshipsPage from './pages/admin/AdminInternshipsPage';
import AdminBatchesPage from './pages/admin/AdminBatchesPage';
import AdminLocationsPage from './pages/admin/AdminLocationsPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminFAQsPage from './pages/admin/AdminFAQsPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminGenericPage from './pages/admin/AdminGenericPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminContentStudioPage from './pages/admin/AdminContentStudioPage';
import AdminNavigationPage from './pages/admin/AdminNavigationPage';

// ── Payment placeholder pages ───────────────────────────────
function CheckoutPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-card-xl">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display font-bold text-2xl mb-3">Checkout</h2>
        <p className="text-surface-500 mb-6">
          Online payment integration is coming soon. Contact our admissions team to enroll and discuss payment options.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/contact" className="btn-primary btn justify-center">Contact Admissions</Link>
          <Link to="/courses" className="btn-secondary btn justify-center">Browse Courses</Link>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-card-xl">
        <div className="text-5xl mb-4">ℹ️</div>
        <h2 className="font-display font-bold text-2xl mb-3">Payment Not Verified</h2>
        <p className="text-surface-500 mb-6">
          Online checkout is not configured, so this website cannot confirm a payment or enrollment. Please contact admissions if you need help.
        </p>
        <Link to="/contact" className="btn-primary btn justify-center inline-flex">Contact Admissions</Link>
      </div>
    </div>
  );
}

function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-card-xl">
        <div className="text-5xl mb-4">ℹ️</div>
        <h2 className="font-display font-bold text-2xl mb-3">Payment Status Unavailable</h2>
        <p className="text-surface-500 mb-6">
          Online checkout is not configured, so this website cannot process or verify payments. Contact admissions to discuss enrollment.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/contact" className="btn-primary btn justify-center">Contact Admissions</Link>
          <Link to="/courses" className="btn-secondary btn justify-center">Browse Courses</Link>
        </div>
      </div>
    </div>
  );
}

// ── Router ───────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Main website layout ───────────────────────────────────
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },

      // Courses
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:slug', element: <CourseDetailPage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },

      // Master Programs
      { path: 'master-programs', element: <MasterProgramsPage /> },
      { path: 'master-programs/:slug', element: <MasterProgramDetailPage /> },

      // Training modes
      { path: 'online-training', element: <OnlineTrainingPage /> },
      { path: 'classroom-training', element: <ClassroomTrainingPage /> },
      { path: 'certifications', element: <CertificationsPage /> },

      // Career
      { path: 'career', element: <CareerPage /> },
      { path: 'placement', element: <CareerPage /> },
      { path: 'career/job-support', element: <JobSupportPage /> },
      { path: 'job-support', element: <JobSupportPage /> },
      { path: 'career/interview-preparation', element: <InterviewPrepPage /> },
      { path: 'interview-preparation', element: <InterviewPrepPage /> },
      { path: 'career/resume-preparation', element: <ResumePrepPage /> },
      { path: 'resume-preparation', element: <ResumePrepPage /> },
      { path: 'career/mock-interview', element: <MockInterviewPage /> },
      { path: 'mock-interview', element: <MockInterviewPage /> },

      // Internships
      { path: 'internships', element: <InternshipsPage /> },
      { path: 'internships/:slug', element: <InternshipDetailPage /> },

      // Corporate
      { path: 'corporate-training', element: <CorporateTrainingPage /> },

      // Trainers
      { path: 'trainers', element: <TrainersPage /> },

      // Company
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },

      // Blog
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },

      // Locations
      { path: 'locations', element: <LocationsPage /> },
      { path: 'locations/:slug', element: <LocationDetailPage /> },

      // Auth
      { path: 'register', element: <RegisterPage /> },

      // Payments
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-failed', element: <PaymentFailedPage /> },

      // Legal
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'refund-policy', element: <RefundPolicyPage /> },
      { path: 'cookie-policy', element: <CookiePolicyPage /> },

      // New feature pages
      { path: 'placement-records', element: <PlacementPage /> },
      { path: 'batch-schedule', element: <BatchSchedulePage /> },
      { path: 'demo-class', element: <DemoClassPage /> },
      { path: 'skill-assessment', element: <SkillAssessmentPage /> },
      { path: 'scholarships', element: <ScholarshipPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'live-projects', element: <LiveProjectsPage /> },
      { path: 'refer-earn', element: <ReferEarnPage /> },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ── Auth pages (no navbar/footer) ────────────────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/admin/login', element: <LoginPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/account/security', element: <AccountSecurityPage /> },

  // ── Dashboard (no navbar/footer) ─────────────────────────
  { path: '/dashboard', element: <StudentDashboardPage /> },

  // ── Admin (dedicated admin layout) ───────────────────────
  {
    path: '/admin',
    element: <AdminAuthGate />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'courses', element: <AdminCoursesPage /> },
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'master-programs', element: <AdminMasterProgramsPage /> },
          { path: 'students', element: <AdminStudentsPage /> },
          { path: 'students/:id', element: <AdminStudentDetailPage /> },
          { path: 'student-progress', element: <AdminStudentProgressPage /> },
          { path: 'attendance', element: <AdminAttendancePage /> },
          { path: 'activity', element: <AdminActivityPage /> },
          { path: 'studio', element: <AdminContentStudioPage /> },
          { path: 'website/:section', element: <AdminContentStudioPage /> },
          { path: 'instructors', element: <AdminInstructorsPage /> },
          { path: 'enquiries', element: <AdminEnquiriesPage /> },
          { path: 'internships', element: <AdminInternshipsPage /> },
          { path: 'batches', element: <AdminBatchesPage /> },
          { path: 'locations', element: <AdminLocationsPage /> },
          { path: 'blog', element: <AdminBlogPage /> },
          { path: 'faqs', element: <AdminFAQsPage /> },
          { path: 'testimonials', element: <AdminTestimonialsPage /> },
          { path: 'certificates', element: <AdminCertificatesPage /> },
          { path: 'payments', element: <AdminPaymentsPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
          { path: 'navigation', element: <AdminNavigationPage /> },
          { path: '*', element: <AdminGenericPage title="Page Not Found" description="This admin page doesn't exist." /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
