import { Quote, Star } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export function TestimonialsSection() {
  const reviews = useCmsCollection('testimonials', testimonials).slice(0, 6);

  return (
    <section className="section bg-surface-50" aria-label="Student success stories">
      <div className="container-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-700">
            Student success stories
          </p>
          <h2 className="display-sm text-surface-900">
            What Our Learners <span className="text-gradient">Say</span>
          </h2>
          <p className="mt-2 text-xs text-surface-500">
            * Demo testimonials — to be replaced with real student reviews.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <article key={review.id} className="flex h-full flex-col rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
                <Quote className="mb-3 h-6 w-6 text-brand-700" aria-hidden="true" />
                <p className="mb-4 flex-1 text-sm leading-relaxed text-surface-700 line-clamp-4">
                  “{review.review}”
                </p>
                <div className="flex items-center gap-2 border-t border-surface-100 pt-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700" aria-hidden="true">
                    {review.name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold text-surface-900">{review.name}</h3>
                    <p className="truncate text-xs text-surface-600 font-medium">{review.role} · {review.location}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 border-t border-surface-100 pt-2 text-xs font-semibold text-brand-700">{review.course}</p>
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
