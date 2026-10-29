import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/Toast';
import { BackToTop } from '../ui/BackToTop';
import { PageTransition } from './PageTransition';
import { QuickContactAssistant } from './QuickContactAssistant';
import { CommandMenu } from '../ui/CommandMenu';

export function Layout() {
  return (
    <>
      <ScrollRestoration />
      {/* Skip-to-content link for keyboard/screen-reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="public-site flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1" id="main-content" tabIndex={-1}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
      <ToastContainer />
      <BackToTop />
      <QuickContactAssistant />
      <CommandMenu />
    </>
  );
}
