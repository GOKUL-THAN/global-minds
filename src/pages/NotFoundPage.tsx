import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { DecryptedText } from '../components/ui/DecryptedText';
import { Magnetic } from '../components/ui/Magnetic';
import { ShinyText } from '../components/ui/ShinyText';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <SpotlightCard className="max-w-lg w-full">
        <div className="text-center p-8 sm:p-12 bg-white rounded-3xl border border-surface-200 shadow-card-lg">
          <div className="text-8xl font-black text-brand-600/30 mb-2 tracking-tighter">
            <DecryptedText text="404" speed={70} maxIterations={15} />
          </div>
          <h1 className="font-display font-bold text-3xl text-surface-900 mb-3">
            <ShinyText text="Page Not Found" shinyColor="rgba(23, 108, 115, 0.9)" />
          </h1>
          <p className="text-surface-600 font-medium mb-8 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Magnetic>
                <Button size="lg" leftIcon={<Home className="w-4 h-4" />}>Go Home</Button>
              </Magnetic>
            </Link>
            <Link to="/courses">
              <Magnetic>
                <Button variant="secondary" size="lg" leftIcon={<Search className="w-4 h-4" />}>Browse Courses</Button>
              </Magnetic>
            </Link>
            <Magnetic>
              <button onClick={() => window.history.back()} className="btn btn-ghost btn-lg flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
            </Magnetic>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
