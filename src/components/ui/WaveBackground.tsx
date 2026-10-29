import { useEffect, useRef } from 'react';

interface WaveBackgroundProps {
  className?: string;
  strokeColor?: string;
  waveCount?: number;
  speed?: number;
}

export function WaveBackground({
  className = '',
  strokeColor = 'rgba(13, 148, 136, 0.18)',
  waveCount = 3,
  speed = 0.015,
}: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let step = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      for (let j = 0; j < waveCount; j++) {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = strokeColor;

        const amplitude = 28 + j * 12;
        const frequency = 0.003 - j * 0.0005;
        const phase = step + (j * Math.PI) / 3;

        for (let x = 0; x <= width; x += 4) {
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude * Math.cos(x * 0.001);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (!prefersReducedMotion) {
        step += speed;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [strokeColor, waveCount, speed]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full opacity-60" />
    </div>
  );
}

