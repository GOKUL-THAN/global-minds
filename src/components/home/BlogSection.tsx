import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { blogPosts } from '../../data/blogs';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { useCmsCollection } from '../../hooks/useCmsCollection';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShinyText } from '../ui/ShinyText';

export function BlogSection() {
  const posts = useCmsCollection('blog', blogPosts);
  const featured = posts.filter(post => post.featured).slice(0, 3);

  return (
    <section className="section bg-white" aria-label="Blog and resources">
      <div className="container-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-sm text-brand-700 font-bold uppercase tracking-wider mb-3">
              <ShinyText text="📖 Knowledge hub" shinyColor="rgba(23, 108, 115, 0.9)" />
            </p>
            <h2 className="display-md">
              Latest from the{' '}
              <span className="text-gradient">Blog</span>
            </h2>
          </div>
          <Link to="/blog">
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Articles
            </Button>
          </Link>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {featured.map(post => (
            <SpotlightCard key={post.id} className="h-full">
              <Link
                to={`/blog/${post.slug}`}
                className={cn(
                  'group block h-full rounded-2xl overflow-hidden border border-surface-200 bg-white',
                  'hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between',
                )}
              >
                <div>
                  {/* Image */}
                  <div className="overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="brand">{post.category}</Badge>
                      <span className="text-xs text-surface-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-surface-900 group-hover:text-brand-700 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-surface-600 font-medium line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Author + date */}
                <div className="flex items-center gap-3 p-6 pt-4 border-t border-surface-200">
                  <img
                    src={post.author.photo}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-xs font-semibold text-surface-800">{post.author.name}</p>
                    <p className="text-xs text-surface-600 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>
              </Link>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
