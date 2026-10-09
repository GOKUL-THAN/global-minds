import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import { testimonials } from '../../data/testimonials';
import { cn } from '../../utils/cn';
import { useCmsCollection } from '../../hooks/useCmsCollection';

export function TestimonialsSection() {
  const visibleTestimonials = useCmsCollection('testimonials', testimonials);
  const featured = visibleTestimonials.filter(t => t.featured);
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => setCurrentIndex(p => (p - 1 + featured.length) % featured.length);
  const next = () => setCurrentIndex(p => (p + 1) % featured.length);

  return (
    <section className="section bg-surface-50" aria-label="Student testimonials">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider mb-3">
            Student success stories
          </p>
          <h2 className="display-md">
            What Our Learners{' '}
            <span className="text-gradient">Say</span>
          </h2>
          <p className="text-surface-400 text-sm mt-3">
            * Demo testimonials — to be replaced with real student reviews.
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featured.slice(0, 6).map(testimonial => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-brand-200 mb-4" />
              <p className="text-surface-600 text-sm leading-relaxed mb-5 line-clamp-4">
                "{testimonial.review}"
              </p>
              <div className="flex items-center gap-3">
                {testimonial.photo ? (
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-surface-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-surface-400">{testimonial.role} · {testimonial.location}</p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={testimonial.rating} size="sm" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-100">
                <p className="text-xs text-brand-600 font-medium">{testimonial.course}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          {featured[currentIndex] && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <Quote className="w-8 h-8 text-brand-200 mb-4" />
              <p className="text-surface-600 text-sm leading-relaxed mb-5">
                "{featured[currentIndex].review}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                  {featured[currentIndex].name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-surface-900 text-sm">{featured[currentIndex].name}</p>
                  <p className="text-xs text-surface-400">{featured[currentIndex].role} · {featured[currentIndex].location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-xl bg-white border border-surface-200 hover:bg-brand-50 transition-colors" aria-label="Previous">
              <ChevronLeft className="w-5 h-5 text-surface-600" />
            </button>
            <div className="flex gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    i === currentIndex ? 'bg-brand-600 w-4' : 'bg-surface-300',
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-xl bg-white border border-surface-200 hover:bg-brand-50 transition-colors" aria-label="Next">
              <ChevronRight className="w-5 h-5 text-surface-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
