import { useEffect, useState, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';

export interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover' | 'both';
}

export function DecryptedText({
  text,
  speed = 45,
  maxIterations = 12,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+0123456789',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20px' });

  const getNextIndex = useCallback(
    (revealedSet: Set<number>): number | null => {
      const len = text.length;
      switch (revealDirection) {
        case 'start':
          for (let i = 0; i < len; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return null;
        case 'end':
          for (let i = len - 1; i >= 0; i--) {
            if (!revealedSet.has(i)) return i;
          }
          return null;
        case 'center': {
          const middle = Math.floor(len / 2);
          for (let offset = 0; offset <= middle; offset++) {
            const left = middle - offset;
            const right = middle + offset;
            if (left >= 0 && !revealedSet.has(left)) return left;
            if (right < len && !revealedSet.has(right)) return right;
          }
          return null;
        }
        default:
          return null;
      }
    },
    [text.length, revealDirection]
  );

  const availableChars = useOriginalCharsOnly
    ? Array.from(new Set(text.split(''))).filter(c => c !== ' ')
    : characters.split('');

  const triggerAnimation = useCallback(() => {
    setIsScrambling(true);
    setRevealedIndices(new Set());
  }, []);

  useEffect(() => {
    if (isInView && (animateOn === 'view' || animateOn === 'both') && !hasAnimated) {
      triggerAnimation();
      setHasAnimated(true);
    }
  }, [isInView, animateOn, hasAnimated, triggerAnimation]);

  useEffect(() => {
    if (!isScrambling) return;

    let intervalId: ReturnType<typeof setInterval>;
    let currentIteration = 0;

    intervalId = setInterval(() => {
      setRevealedIndices(prevRevealed => {
        if (sequential) {
          if (prevRevealed.size < text.length) {
            const nextIndex = getNextIndex(prevRevealed);
            const newRevealed = new Set(prevRevealed);
            if (nextIndex !== null) {
              newRevealed.add(nextIndex);
            }
            setDisplayText(
              text
                .split('')
                .map((char, i) => {
                  if (char === ' ') return ' ';
                  if (newRevealed.has(i)) return char;
                  const randomIdx = Math.floor(Math.random() * availableChars.length);
                  return availableChars[randomIdx] || char;
                })
                .join('')
            );
            return newRevealed;
          } else {
            clearInterval(intervalId);
            setIsScrambling(false);
            setDisplayText(text);
            return prevRevealed;
          }
        } else {
          setDisplayText(
            text
              .split('')
              .map((char, i) => {
                if (char === ' ') return ' ';
                if (prevRevealed.has(i)) return char;
                if (currentIteration >= maxIterations) {
                  return char;
                }
                const randomIdx = Math.floor(Math.random() * availableChars.length);
                return availableChars[randomIdx] || char;
              })
              .join('')
          );

          currentIteration++;
          if (currentIteration >= maxIterations) {
            clearInterval(intervalId);
            setIsScrambling(false);
            setDisplayText(text);
          }
          return prevRevealed;
        }
      });
    }, speed);

    return () => clearInterval(intervalId);
  }, [isScrambling, text, speed, maxIterations, sequential, getNextIndex, availableChars]);

  const handleMouseEnter = () => {
    if ((animateOn === 'hover' || animateOn === 'both') && !isScrambling) {
      triggerAnimation();
    }
  };

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`inline-block cursor-default ${parentClassName}`}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealedOrDone = revealedIndices.has(index) || !isScrambling || char === ' ';
          return (
            <span
              key={index}
              className={isRevealedOrDone ? className : encryptedClassName || 'opacity-70 font-mono text-teal-600'}
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export default DecryptedText;

