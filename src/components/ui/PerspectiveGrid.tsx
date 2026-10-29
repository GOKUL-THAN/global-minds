interface PerspectiveGridProps {
  className?: string;
  gridColor?: string;
  horizonColor?: string;
}

export function PerspectiveGrid({
  className = '',
  gridColor = 'rgba(13, 148, 136, 0.18)',
  horizonColor = 'rgba(23, 108, 115, 0.25)',
}: PerspectiveGridProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden [perspective:1000px] ${className}`}
      aria-hidden="true"
    >
      {/* Horizon glow */}
      <div
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-transparent to-transparent opacity-80"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${horizonColor}, transparent 70%)`,
        }}
      />

      {/* 3D Grid plane */}
      <div
        className="absolute inset-0 origin-bottom"
        style={{
          transform: 'rotateX(55deg) translateZ(0)',
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
        }}
      />
    </div>
  );
}

