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
      <div className="bg-gradient-to-r from-surface-950 to-brand-950 text-white py-16">
        <div className="container-xl">
          <Breadcrumbs items={[{ label: 'Blog' }]} className="text-white/50 mb-4" />
          <h1 className="display-lg text-white mb-4">Blog & Resources</h1>
          <p className="text-white/70">Tech insights, career guidance, certification tips and industry trends.</p>
          <p className="text-white/40 text-sm mt-2">* Placeholder blog posts — to be replaced with real articles.</p>
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
                    <span className="text-xs text-surface-400 flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  </div>
                  <h2 className="font-display font-semibold text-surface-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-surface-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
                    <img src={post.author.photo} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-surface-800">{post.author.name}</p>
                      <p className="text-xs text-surface-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-surface-400 ml-auto group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
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
