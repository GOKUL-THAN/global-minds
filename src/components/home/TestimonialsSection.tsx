import { Quote, Star } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export function TestimonialsSection() {
  const reviews = useCmsCollection('testimonials', testimonials).slice(0, 6);

  return (
    <section className="section bg-surface-50" aria-label="Student success stories">
      <div className="container-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
            Student success stories
          </p>
          <h2 className="display-sm">
            What Our Learners <span className="text-gradient">Say</span>
          </h2>
          <p className="mt-2 text-xs text-surface-400">
            * Demo testimonials — to be replaced with real student reviews.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <article key={review.id} className="flex h-full flex-col rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
                <Quote className="mb-3 h-6 w-6 text-brand-700" aria-hidden="true" />
                <p className="mb-4 flex-1 text-xs leading-relaxed text-surface-600 line-clamp-4">
                  “{review.review}”
                </p>
                <div className="flex items-center gap-2 border-t border-surface-100 pt-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700" aria-hidden="true">
                    {review.name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[11px] font-bold text-surface-900">{review.name}</h3>
                    <p className="truncate text-[10px] text-surface-400">{review.role} · {review.location}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 text-amber-400" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Star key={index} className="h-3 w-3 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 border-t border-surface-100 pt-2 text-[10px] font-medium text-brand-700">{review.course}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-surface-500">Learner reviews will appear here soon.</p>
        )}
      </div>
    </section>
  );
}
