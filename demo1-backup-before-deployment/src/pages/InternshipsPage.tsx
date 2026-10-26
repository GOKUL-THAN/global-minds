import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, CheckCircle, ArrowRight, Search, Filter } from 'lucide-react';
import { allowedInternshipCategories, internships } from '../data/internships';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CTASection } from '../components/home/CTASection';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';
import { cn } from '../utils/cn';
import { useCmsCollection } from '../hooks/useCmsCollection';

const categories = ['All', ...allowedInternshipCategories];
const modes = ['All', 'Online', 'Classroom', 'Both'];

export default function InternshipsPage() {
  const visibleInternships = useCmsCollection('internships', internships)
    .filter(internship => allowedInternshipCategories.includes(internship.category));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'coming-soon'>('all');

  usePageMeta({
    title: 'Course Internships — AWS / Cloud, Data Science, Machine Learning & More',
    description: 'Explore internships related to AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Software Testing, and Automation Testing.',
  });

  const filtered = visibleInternships.filter(i => {
    const matchSearch = !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'All' || i.category === selectedCategory;
    const matchMode = selectedMode === 'All' || i.mode === selectedMode;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchCat && matchMode && matchStatus;
  });

  const openCount = visibleInternships.filter(i => i.status === 'open').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Internships' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Internships</h1>
          <p className="text-white/70 text-xl max-w-2xl">
            Gain real industry experience through internships related to AWS / Cloud, Data Science, Machine Learning, Full Stack Development, Software Testing, and Automation Testing.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium">
              {openCount} Open Positions
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm">
              Certificate Included
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm">
              Remote & On-site
            </div>
          </div>
          <p className="text-white/40 text-xs mt-4">
            * Placeholder listings — contact us for current internship availability.
          </p>
        </div>
      </div>

      <div className="container-xl py-10">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-surface-100 p-4 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, category or skill..."
                className="form-input pl-9"
                aria-label="Search internships"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-surface-400 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="form-select"
                aria-label="Filter by category"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select
                value={selectedMode}
                onChange={e => setSelectedMode(e.target.value)}
                className="form-select"
                aria-label="Filter by mode"
              >
                {modes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'all', label: `All (${visibleInternships.length})` },
              { id: 'open', label: `Open (${openCount})` },
              { id: 'coming-soon', label: `Coming Soon (${visibleInternships.filter(i => i.status === 'coming-soon').length})` },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  statusFilter === tab.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-surface-200 mx-auto mb-4" />
            <h3 className="font-semibold text-surface-700 mb-2">No internships found</h3>
            <p className="text-surface-500 text-sm mb-4">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedMode('All'); setStatusFilter('all'); }} className="btn-secondary btn text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(internship => (
              <div key={internship.id} className="card-hover overflow-hidden flex flex-col">
                <div className="relative">
                  <img
                    src={internship.thumbnail}
                    alt={internship.title}
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={internship.status === 'open' ? 'green' : internship.status === 'coming-soon' ? 'yellow' : 'gray'}>
                      {internship.status === 'open' ? '✓ Open' : internship.status === 'coming-soon' ? 'Coming Soon' : 'Closed'}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-brand-600 font-semibold">{internship.category}</span>
                    <span className="text-xs text-surface-400">{internship.mode}</span>
                  </div>

                  <h3 className="font-display font-semibold text-surface-900 mb-1">{internship.title}</h3>
                  <p className="text-surface-500 text-xs mb-3">{internship.company}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-surface-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{internship.duration}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{internship.location}</span>
                    {internship.certificate && (
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" />Certificate</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {internship.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{s}</span>
                    ))}
                    {internship.skills.length > 4 && (
                      <span className="text-xs bg-surface-100 text-surface-400 px-2 py-0.5 rounded-lg">+{internship.skills.length - 4}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-surface-100 flex gap-2">
                    <Link to={`/internships/${internship.slug}`} className="flex-1">
                      <Button variant="secondary" size="sm" fullWidth>
                        View Details
                      </Button>
                    </Link>
                    {internship.status === 'open' && (
                      <Link to={`/internships/${internship.slug}#apply-form`} className="flex-1">
                        <Button size="sm" fullWidth rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Apply
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CTASection
        title="Build Your Career with an Internship"
        subtitle="Complete a course and apply for internship opportunities to gain real industry experience."
        primaryLabel="Explore Courses"
        primaryHref="/courses"
        secondaryLabel="Register Interest"
        secondaryHref="/register"
      />
    </div>
  );
}
