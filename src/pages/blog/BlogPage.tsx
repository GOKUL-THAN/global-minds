import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogPosts } from '../../data/blogs';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function BlogPage() {
  const posts = useCmsCollection('blog', blogPosts);
  return (
    <div className="min-h-screen bg-white">
      <div className="page-hero-premium py-16 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Blog' }]} className="mb-4" />
          <div className="page-hero-badge mb-4">
            Tech Insights &amp; Career Roadmaps
          </div>
          <h1 className="page-hero-title mb-4">
            Blog &amp; <span className="page-hero-highlight">Resources</span>
          </h1>
          <p className="page-hero-desc text-lg sm:text-xl max-w-2xl leading-relaxed">
            Tech insights, career guidance, certification tips, and real-world developer tutorials written by mentors.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="page-hero-chip">Cloud &amp; DevOps</div>
            <div className="page-hero-chip">AI &amp; Data Science</div>
            <div className="page-hero-chip">Career Guides</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container-xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card-hover overflow-hidden block group">
                <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="brand">{post.category}</Badge>
                    <span className="text-xs text-surface-600 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-600" />{post.readTime}</span>
                  </div>
                  <h2 className="font-display font-bold text-surface-900 group-hover:text-brand-700 transition-colors mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-surface-600 text-sm line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-surface-200">
                    <img src={post.author.photo} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-surface-900">{post.author.name}</p>
                      <p className="text-xs text-surface-600 font-medium flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-600" />{formatDate(post.publishedAt)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-600 ml-auto group-hover:text-brand-800 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
