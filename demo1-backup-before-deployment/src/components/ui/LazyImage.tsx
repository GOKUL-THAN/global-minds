import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

/**
 * Lazy-loading image with blur-up effect.
 * Uses IntersectionObserver — no external library needed.
 */
export function LazyImage({
  src,
  alt,
  fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect width="100%25" height="100%25" fill="%23e2e8f0"/%3E%3C/svg%3E',
  aspectRatio,
  objectFit = 'cover',
  className,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn('overflow-hidden', aspectRatio && 'relative')}
      style={aspectRatio ? { paddingBottom: aspectRatio } : undefined}
    >
      <img
        ref={imgRef}
        src={inView ? (error ? fallback : src) : fallback}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          aspectRatio && 'absolute inset-0 w-full h-full',
          className,
        )}
        {...props}
      />
    </div>
  );
}
