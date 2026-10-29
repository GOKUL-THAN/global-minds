import { useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchOnHover?: boolean;
}

export function GlitchText({
  text,
  className = '',
  glitchOnHover = true,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  return (
    <span
      className={`relative inline-block select-none font-bold transition-transform ${className}`}
      onMouseEnter={() => glitchOnHover && setIsGlitching(true)}
      onMouseLeave={() => glitchOnHover && setIsGlitching(false)}
    >
      <span className="relative z-10">{text}</span>

      {isGlitching && (
        <>
          <span
            className="absolute left-0 top-0 z-0 text-cyan-500 opacity-80 mix-blend-screen"
            style={{
              clipPath: 'polygon(0 20%, 100% 20%, 100% 45%, 0 45%)',
              transform: 'translate(-2px, -1px)',
              animation: 'glitch-anim 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
            }}
            aria-hidden="true"
          >
            {text}
          </span>
          <span
            className="absolute left-0 top-0 z-0 text-rose-500 opacity-80 mix-blend-screen"
            style={{
              clipPath: 'polygon(0 55%, 100% 55%, 100% 80%, 0 80%)',
              transform: 'translate(2px, 1px)',
              animation: 'glitch-anim2 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite',
            }}
            aria-hidden="true"
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

