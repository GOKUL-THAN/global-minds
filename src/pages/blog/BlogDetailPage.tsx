import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import { blogPosts } from '../../data/blogs';
import { formatDate } from '../../utils/formatters';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { usePageMeta } from '../../hooks/usePageMeta';
import NotFoundPage from '../NotFoundPage';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = useCmsCollection('blog', blogPosts);
  const post = posts.find(item => item.slug === (slug || ''));

  usePageMeta({
    title: post?.metaTitle || post?.title,
    description: post?.metaDescription || post?.excerpt,
    ogImage: post?.featuredImage,
    ogType: 'article',
  });

  if (!post) return <NotFoundPage />;

  const others = posts.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-14 relative overflow-hidden">
        <div className="container-xl max-w-4xl relative z-10">
          <Breadcrumbs
            items={[
              { label: 'Blog', href: '/blog' },
              { label: post.category, href: `/blog?category=${post.category}` },
              { label: post.title },
            ]}
            className="mb-6"
          />
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="page-hero-badge">{post.category}</div>
            <span className="page-hero-chip font-medium text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" /> {post.readTime}
            </span>
            <span className="page-hero-chip font-medium text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" /> {formatDate(post.publishedAt)}
            </span>
          </div>
          <h1 className="page-hero-title mb-6">{post.title}</h1>
          <p className="page-hero-desc text-lg sm:text-xl leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-3">
            <img
              src={post.author.photo}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/30"
            />
            <div>
              <p className="font-bold text-surface-900">{post.author.name}</p>
              <p className="text-sm text-surface-600 font-medium">{post.author.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured image */}
      <div className="container-xl max-w-4xl py-8">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-80 object-cover rounded-3xl mb-10"
          loading="eager"
        />

        {/* Content */}
        <article className="prose prose-lg max-w-none text-surface-700 leading-relaxed mb-12">
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm mb-8">
            <strong>Note:</strong> This is placeholder blog content. Replace with the actual article text.
          </div>
          <p>{post.content}</p>
          <p className="mt-6">
            This article covers important aspects of {post.category} that every technology professional should understand. 
            The content above is a placeholder and will be replaced with the full, real article text.
          </p>
          <p className="mt-4">
            Stay tuned for more insights from the Global Minds Academy blog — covering cloud computing, DevOps, AI, 
            data science, software testing, career guidance and much more.
          </p>
        </article>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-surface-200">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-100 text-surface-700 text-sm font-medium border border-surface-200"
            >
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              {tag}
            </span>
          ))}
        </div>

        {/* Author bio */}
        <div className="bg-surface-50 border border-surface-200 rounded-3xl p-8 mb-12 flex gap-5 items-start">
          <img
            src={post.author.photo}
            alt={post.author.name}
            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
          />
          <div>
            <p className="font-display font-bold text-surface-900 text-lg mb-1">{post.author.name}</p>
            <p className="text-brand-700 text-sm font-semibold mb-2">{post.author.role}</p>
            <p className="text-surface-600 text-sm font-medium leading-relaxed">
              Expert instructor at Global Minds Academy. Placeholder author bio — to be updated with real profile information.
            </p>
          </div>
        </div>

        {/* More posts */}
        {others.length > 0 && (
          <div>
            <h2 className="heading-xl mb-6">More from the Blog</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {others.map(p => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-surface-200 hover:border-brand-300 hover:shadow-card-md transition-all"
                >
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <Badge variant="brand" className="mb-2">{p.category}</Badge>
                    <h3 className="font-bold text-surface-900 text-sm line-clamp-2 group-hover:text-brand-700 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-surface-600 font-medium mt-2">{p.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-10 pt-8 border-t border-surface-200 flex justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <Link to="/courses" className="flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800">
            Explore Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
