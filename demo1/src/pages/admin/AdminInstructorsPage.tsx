import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus, Star, Users } from 'lucide-react';
import { instructors } from '../../data/instructors';

export default function AdminInstructorsPage() {
  const [search, setSearch] = useState('');
  const filtered = instructors.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-surface-900">Instructors</h1>
          <p className="text-surface-500 text-sm mt-0.5">{instructors.length} trainers (placeholder data)</p>
        </div>
        <button className="btn-primary btn flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
          <Plus className="w-4 h-4" /> Add Instructor
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-100 p-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search instructors..."
          className="form-input"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(trainer => (
          <div key={trainer.id} className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-card-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <img src={trainer.photo} alt={trainer.name} className="w-12 h-12 rounded-xl object-cover" loading="lazy" />
              <div>
                <p className="font-semibold text-surface-900">{trainer.name}</p>
                <p className="text-xs text-brand-600">{trainer.designation}</p>
              </div>
            </div>
            <p className="text-xs text-surface-500 mb-3">{trainer.experience} experience</p>
            <div className="flex items-center gap-4 text-xs text-surface-500 mb-4">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{trainer.rating ?? 4.8}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{trainer.totalStudents?.toLocaleString() ?? 'N/A'}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {trainer.expertise.slice(0, 3).map(e => (
                <span key={e} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-lg">{e}</span>
              ))}
            </div>
            <Link to="/trainers">
              <button className="btn-secondary btn w-full text-sm flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> View Profile
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
