import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Link, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { PageTransition } from './components/layout/PageTransition';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminAuthGate } from './components/admin/AdminAuthGate';

// ── Eager — critical first-paint ──────────────────────────────
import HomePage from './pages/HomePage';

// ── Public pages (lazy) ───────────────────────────────────────
const CoursesPage             = lazy(() => import('./pages/courses/CoursesPage'));
const CourseDetailPage        = lazy(() => import('./pages/courses/CourseDetailPage'));
const CertificationsPage      = lazy(() => import('./pages/CertificationsPage'));
const MasterProgramsPage      = lazy(() => import('./pages/master-programs/MasterProgramsPage'));
const MasterProgramDetailPage = lazy(() => import('./pages/master-programs/MasterProgramDetailPage'));
const CategoryPage            = lazy(() => import('./pages/CategoryPage'));
const OnlineTrainingPage      = lazy(() => import('./pages/OnlineTrainingPage'));
const ClassroomTrainingPage   = lazy(() => import('./pages/ClassroomTrainingPage'));
const CareerPage              = lazy(() => import('./pages/career/CareerPage'));
const JobSupportPage          = lazy(() => import('./pages/career/JobSupportPage'));
const InterviewPrepPage       = lazy(() => import('./pages/career/InterviewPrepPage'));
const ResumePrepPage          = lazy(() => import('./pages/career/ResumePrepPage'));
const MockInterviewPage       = lazy(() => import('./pages/career/MockInterviewPage'));
const InternshipsPage         = lazy(() => import('./pages/InternshipsPage'));
const InternshipDetailPage    = lazy(() => import('./pages/internships/InternshipDetailPage'));
const CorporateTrainingPage   = lazy(() => import('./pages/CorporateTrainingPage'));
const CollegesPage            = lazy(() => import('./pages/CollegesPage'));
const AboutPage               = lazy(() => import('./pages/AboutPage'));
const ContactPage             = lazy(() => import('./pages/ContactPage'));
const BlogPage                = lazy(() => import('./pages/blog/BlogPage'));
const BlogDetailPage          = lazy(() => import('./pages/blog/BlogDetailPage'));
const LocationsPage           = lazy(() => import('./pages/locations/LocationsPage'));
const LocationDetailPage      = lazy(() => import('./pages/locations/LocationDetailPage'));
const RegisterPage            = lazy(() => import('./pages/RegisterPage'));
const PrivacyPolicyPage       = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const TermsPage               = lazy(() => import('./pages/legal/TermsPage'));
const RefundPolicyPage        = lazy(() => import('./pages/legal/RefundPolicyPage'));
const CookiePolicyPage        = lazy(() => import('./pages/legal/CookiePolicyPage'));
const NotFoundPage            = lazy(() => import('./pages/NotFoundPage'));
const PlacementPage           = lazy(() => import('./pages/PlacementPage'));
const BatchSchedulePage       = lazy(() => import('./pages/BatchSchedulePage'));
const DemoClassPage           = lazy(() => import('./pages/DemoClassPage'));
const SkillAssessmentPage     = lazy(() => import('./pages/SkillAssessmentPage'));
const ScholarshipPage         = lazy(() => import('./pages/ScholarshipPage'));
const EventsPage              = lazy(() => import('./pages/EventsPage'));
const LiveProjectsPage        = lazy(() => import('./pages/LiveProjectsPage'));
const ReferEarnPage           = lazy(() => import('./pages/ReferEarnPage'));

// ── Auth pages — default exports (lazy) ───────────────────────
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const AccountSecurityPage = lazy(() => import('./pages/auth/AccountSecurityPage'));

// ── Auth pages — named exports: wrap each in a re-export shim ─
// React.lazy requires { default: Component }
const VerifyEmailPage    = lazy(() =>
  import('./pages/auth/AccountRecoveryPages').then(m => ({ default: m.VerifyEmailPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/AccountRecoveryPages').then(m => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage  = lazy(() =>
  import('./pages/auth/AccountRecoveryPages').then(m => ({ default: m.ResetPasswordPage })),
);

// ── Dashboard & certificate (lazy) ────────────────────────────
const StudentDashboardPage = lazy(() => import('./pages/dashboard/StudentDashboardPage'));
const CertificateViewPage  = lazy(() => import('./pages/CertificateViewPage'));

// ── Admin pages (lazy) ────────────────────────────────────────
const AdminDashboardPage      = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminCoursesPage        = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminEnquiriesPage      = lazy(() => import('./pages/admin/AdminEnquiriesPage'));
const AdminSettingsPage       = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminGenericPage        = lazy(() => import('./pages/admin/AdminGenericPage'));
const AdminOperationalPage    = lazy(() => import('./pages/admin/AdminOperationalPage'));
const AdminContentStudioPage  = lazy(() => import('./pages/admin/AdminContentStudioPage'));
const AdminNavigationPage     = lazy(() => import('./pages/admin/AdminNavigationPage'));
const AdminUnavailablePage    = lazy(() => import('./pages/admin/AdminUnavailablePage'));
const AdminAnnouncementsPage  = lazy(() => import('./pages/admin/AdminAnnouncementsPage'));
const AdminUserManagementPage = lazy(() => import('./pages/admin/AdminUserManagementPage'));

// ── Suspense fallback ─────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true" aria-live="polite">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"
        role="status"
      >
        <span className="sr-only">Loading page…</span>
      </div>
    </div>
  );
}

/** Wraps any lazy page in a Suspense boundary with a spinner fallback. */
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ── Payment placeholder pages (tiny — inline is fine) ─────────
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
          Online checkout is not configured, so this website cannot confirm a payment or enrollment.
          Please contact admissions if you need help.
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
          Online checkout is not configured, so this website cannot process or verify payments.
          Contact admissions to discuss enrollment.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/contact" className="btn-primary btn justify-center">Contact Admissions</Link>
          <Link to="/courses" className="btn-secondary btn justify-center">Browse Courses</Link>
        </div>
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Main website layout ───────────────────────────────────
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },

      // Courses
      { path: 'courses',       element: <S><CoursesPage /></S> },
      { path: 'courses/:slug', element: <S><CourseDetailPage /></S> },
      { path: 'categories/:slug', element: <S><CategoryPage /></S> },

      // Master programs
      { path: 'master-programs',       element: <S><MasterProgramsPage /></S> },
      { path: 'master-programs/:slug', element: <S><MasterProgramDetailPage /></S> },

      // Training modes
      { path: 'online-training',    element: <S><OnlineTrainingPage /></S> },
      { path: 'classroom-training', element: <S><ClassroomTrainingPage /></S> },
      { path: 'certifications',     element: <S><CertificationsPage /></S> },

      // Career
      { path: 'career',                       element: <S><CareerPage /></S> },
      { path: 'placement',                    element: <S><CareerPage /></S> },
      { path: 'career/job-support',           element: <S><JobSupportPage /></S> },
      { path: 'job-support',                  element: <S><JobSupportPage /></S> },
      { path: 'career/interview-preparation', element: <S><InterviewPrepPage /></S> },
      { path: 'interview-preparation',        element: <S><InterviewPrepPage /></S> },
      { path: 'career/resume-preparation',    element: <S><ResumePrepPage /></S> },
      { path: 'resume-preparation',           element: <S><ResumePrepPage /></S> },
      { path: 'career/mock-interview',        element: <S><MockInterviewPage /></S> },
      { path: 'mock-interview',               element: <S><MockInterviewPage /></S> },

      // Internships
      { path: 'internships',       element: <S><InternshipsPage /></S> },
      { path: 'internships/:slug', element: <S><InternshipDetailPage /></S> },

      // Corporate / Colleges
      { path: 'corporate-training', element: <S><CorporateTrainingPage /></S> },
      { path: 'colleges',           element: <S><CollegesPage /></S> },
      { path: 'colleges/*',         element: <S><CollegesPage /></S> },

      // Company
      { path: 'about',   element: <S><AboutPage /></S> },
      { path: 'contact', element: <S><ContactPage /></S> },

      // Blog
      { path: 'blog',       element: <S><BlogPage /></S> },
      { path: 'blog/:slug', element: <S><BlogDetailPage /></S> },

      // Locations
      { path: 'locations',       element: <S><LocationsPage /></S> },
      { path: 'locations/:slug', element: <S><LocationDetailPage /></S> },

      // Auth
      { path: 'register', element: <S><RegisterPage /></S> },

      // Payments
      { path: 'checkout',        element: <CheckoutPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-failed',  element: <PaymentFailedPage /> },

      // Legal
      { path: 'privacy-policy', element: <S><PrivacyPolicyPage /></S> },
      { path: 'terms',          element: <S><TermsPage /></S> },
      { path: 'refund-policy',  element: <S><RefundPolicyPage /></S> },
      { path: 'cookie-policy',  element: <S><CookiePolicyPage /></S> },

      // Feature pages
      { path: 'placement-records', element: <S><PlacementPage /></S> },
      { path: 'batch-schedule',    element: <S><BatchSchedulePage /></S> },
      { path: 'demo-class',        element: <S><DemoClassPage /></S> },
      { path: 'skill-assessment',  element: <S><SkillAssessmentPage /></S> },
      { path: 'scholarships',      element: <S><ScholarshipPage /></S> },
      { path: 'events',            element: <S><EventsPage /></S> },
      { path: 'live-projects',     element: <S><LiveProjectsPage /></S> },
      { path: 'projects',          element: <S><LiveProjectsPage /></S> },
      { path: 'refer-earn',        element: <S><ReferEarnPage /></S> },

      // 404
      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },

  // ── Auth pages (no navbar/footer) ────────────────────────
  {
    path: '/login',
    element: <S><PageTransition className="public-site standalone-page"><LoginPage /></PageTransition></S>,
  },
  {
    path: '/admin/login',
    element: <S><PageTransition className="public-site standalone-page"><LoginPage /></PageTransition></S>,
  },
  {
    path: '/verify-email',
    element: <S><PageTransition className="public-site standalone-page"><VerifyEmailPage /></PageTransition></S>,
  },
  {
    path: '/forgot-password',
    element: <S><PageTransition className="public-site standalone-page"><ForgotPasswordPage /></PageTransition></S>,
  },
  {
    path: '/reset-password',
    element: <S><PageTransition className="public-site standalone-page"><ResetPasswordPage /></PageTransition></S>,
  },
  {
    path: '/account/security',
    element: <S><PageTransition className="public-site standalone-page"><AccountSecurityPage /></PageTransition></S>,
  },

  // ── Dashboard (no navbar/footer) ─────────────────────────
  {
    path: '/dashboard',
    element: <S><PageTransition className="public-site standalone-page"><StudentDashboardPage /></PageTransition></S>,
  },
  {
    path: '/certificates/:certificateId',
    element: <S><PageTransition className="public-site standalone-page"><CertificateViewPage /></PageTransition></S>,
  },

  // ── Admin (dedicated admin layout) ───────────────────────
  {
    path: '/admin',
    element: <AdminAuthGate />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true,                  element: <S><AdminDashboardPage /></S> },
          { path: 'courses',              element: <S><AdminCoursesPage /></S> },
          { path: 'categories',           element: <Navigate to="/admin/website/categories" replace /> },
          { path: 'master-programs',      element: <Navigate to="/admin/website/master-programs" replace /> },
          { path: 'students',             element: <S><AdminOperationalPage /></S> },
          { path: 'student-progress',     element: <Navigate to="/admin/students" replace /> },
          { path: 'attendance',           element: <S><AdminOperationalPage /></S> },
          { path: 'activity',             element: <S><AdminOperationalPage /></S> },
          { path: 'studio',               element: <S><AdminContentStudioPage /></S> },
          { path: 'website/website-menu', element: <S><AdminNavigationPage /></S> },
          { path: 'website/:section',     element: <S><AdminContentStudioPage /></S> },
          { path: 'instructors',          element: <Navigate to="/admin/website/instructors" replace /> },
          { path: 'enquiries',            element: <S><AdminEnquiriesPage /></S> },
          { path: 'internships',          element: <S><AdminOperationalPage /></S> },
          { path: 'batches',              element: <S><AdminOperationalPage /></S> },
          { path: 'locations',            element: <Navigate to="/admin/website/locations" replace /> },
          { path: 'blog',                 element: <Navigate to="/admin/website/blog" replace /> },
          { path: 'faqs',                 element: <Navigate to="/admin/website/faqs" replace /> },
          { path: 'testimonials',         element: <Navigate to="/admin/website/testimonials" replace /> },
          { path: 'certificates',         element: <S><AdminOperationalPage /></S> },
          { path: 'announcements',        element: <S><AdminAnnouncementsPage /></S> },
          { path: 'users',                element: <S><AdminUserManagementPage /></S> },
          { path: 'payments',             element: <S><AdminUnavailablePage /></S> },
          { path: 'settings',             element: <S><AdminSettingsPage /></S> },
          { path: 'navigation',           element: <S><AdminNavigationPage /></S> },
          {
            path: '*',
            element: (
              <S>
                <AdminGenericPage title="Page Not Found" description="This admin page doesn't exist." />
              </S>
            ),
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
