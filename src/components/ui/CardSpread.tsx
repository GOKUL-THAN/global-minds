import { useState, type ReactNode } from 'react';

interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  content: ReactNode;
}

interface CardSpreadProps {
  cards: CardItem[];
  className?: string;
}

export function CardSpread({ cards, className = '' }: CardSpreadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div
      className={`relative flex items-center justify-center py-10 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveIndex(null);
      }}
    >
      <div className="relative h-64 w-80 sm:h-72 sm:w-96">
        {cards.slice(0, 4).map((card, index) => {
          const total = Math.min(cards.length, 4);
          const offset = index - Math.floor(total / 2);
          const rotation = isHovered ? offset * 12 : offset * 4;
          const translateX = isHovered ? offset * 45 : offset * 8;
          const translateY = isHovered ? -Math.abs(offset) * 10 : 0;
          const isSelected = activeIndex === index;

          return (
            <div
              key={card.id}
              onClick={() => setActiveIndex(isSelected ? null : index)}
              className="absolute inset-0 cursor-pointer rounded-2xl border border-surface-200 bg-white p-6 shadow-card-lg transition-all duration-500 ease-out hover:z-40 hover:shadow-2xl"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(${isSelected ? 1.05 : 1})`,
                zIndex: isSelected ? 50 : index + 10,
              }}
            >
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <span className="font-display font-bold text-surface-900 text-sm">{card.title}</span>
                {card.badge && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-3 text-xs text-surface-600 leading-relaxed">
                {card.content}
              </div>
              {card.subtitle && (
                <div className="absolute bottom-4 left-6 right-6 text-[11px] font-semibold text-brand-700">
                  {card.subtitle}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

