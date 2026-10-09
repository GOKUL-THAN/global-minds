import { Link } from 'react-router-dom';
import { Eye, Edit2, Plus, Calendar } from 'lucide-react';
import { blogPosts } from '../../data/blogs';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Blog</h1>
          <p className="text-surface-500 text-sm mt-0.5">{blogPosts.length} posts (placeholder data)</p>
        </div>
        <button className="btn-primary btn flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Post</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden lg:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {blogPosts.map(post => (
                <tr key={post.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={post.featuredImage} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <div>
                        <p className="font-medium text-surface-900 line-clamp-1">{post.title}</p>
                        <p className="text-xs text-surface-400">{post.readTime}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="brand">{post.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-600 hidden lg:table-cell">{post.author.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-surface-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.publishedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/blog/${post.slug}`} target="_blank">
                        <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50" title="View"><Eye className="w-4 h-4" /></button>
                      </Link>
                      <button className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 opacity-50" disabled title="Edit — requires backend"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
