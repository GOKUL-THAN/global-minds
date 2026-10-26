import { useState } from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { useCmsCollection } from '../../hooks/useCmsCollection';

function GoogleWordmark() {
  return (
    <span aria-label="Google" className="text-4xl font-semibold tracking-tight" role="img">
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

export function GoogleReviewsCarousel() {
  const allReviews = useCmsCollection('testimonials', testimonials);
  const reviews = allReviews.slice(6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleReviews = Array.from({ length: Math.min(3, reviews.length) }, (_, offset) => (
    reviews[(currentIndex + offset) % reviews.length]
  ));

  const previous = () => setCurrentIndex(index => (index - 1 + reviews.length) % reviews.length);
  const next = () => setCurrentIndex(index => (index + 1) % reviews.length);

  if (reviews.length === 0) return null;

  return (
    <section className="section bg-white" aria-label="Google learner reviews">
      <div className="container-xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black uppercase tracking-wide text-surface-950">Excellent</h2>
          <div className="mt-3 flex gap-1.5 text-amber-400" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="h-8 w-8 fill-current" aria-hidden="true" />
            ))}
          </div>
          <p className="mt-3 text-surface-700">Based on <strong>their reviews</strong></p>
          <div className="mt-4">
            <GoogleWordmark />
          </div>
        </div>

        <div className="relative px-0 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleReviews.map((review, index) => (
              <article
                key={review.id}
                className={`flex h-full flex-col rounded-2xl border border-surface-200 bg-white p-5 shadow-sm ${
                  index === 1 ? 'hidden md:flex' : ''
                } ${index === 2 ? 'hidden lg:flex' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700" aria-hidden="true">
                    {review.name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-surface-900">{review.name}</h3>
                    <p className="text-sm text-surface-400">
                      {new Date(`${review.date}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span aria-label="Google review" className="text-2xl font-bold text-[#4285F4]">G</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-amber-400" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }, (_, starIndex) => (
                    <Star key={starIndex} className="h-5 w-5 fill-current" aria-hidden="true" />
                  ))}
                  <BadgeCheck className="ml-1 h-4 w-4 fill-blue-500 text-white" aria-label="Verified review" />
                </div>
                <p className="mt-4 flex-1 leading-relaxed text-surface-600 line-clamp-4">{review.review}</p>
              </article>
            ))}
          </div>

          {reviews.length > 1 && (
            <>
              <button
                type="button"
                onClick={previous}
                aria-label="Previous Google reviews"
                className="absolute -left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-700 shadow-md hover:bg-brand-50 md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next Google reviews"
                className="absolute -right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-700 shadow-md hover:bg-brand-50 md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
                <button type="button" onClick={previous} aria-label="Previous Google reviews" className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-700 shadow-sm hover:bg-brand-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-surface-500" aria-live="polite">{currentIndex + 1} / {reviews.length}</span>
                <button type="button" onClick={next} aria-label="Next Google reviews" className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-700 shadow-sm hover:bg-brand-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
