import { Children, isValidElement, type ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedList({
  children,
  className = '',
  delay = 80,
}: AnimatedListProps) {
  const items = Children.toArray(children);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        if (!isValidElement(item)) return null;
        return (
          <div
            key={item.key ?? index}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
            style={{
              animationDelay: `${index * delay}ms`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

