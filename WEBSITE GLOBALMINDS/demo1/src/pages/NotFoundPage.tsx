import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-black text-brand-100 mb-2">404</div>
        <h1 className="font-display font-bold text-3xl text-surface-900 mb-3">Page Not Found</h1>
        <p className="text-surface-500 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" leftIcon={<Home className="w-4 h-4" />}>Go Home</Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary" size="lg" leftIcon={<Search className="w-4 h-4" />}>Browse Courses</Button>
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-ghost btn-lg flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
