import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes, ReactNode } from 'react';

export interface CandyCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Adds a hover lift + speed-line shimmer */
  interactive?: boolean;
}

/** Cookie-card — primary surface for properties, dealers, vehicles. */
export function CandyCard({ className, children, interactive, ...rest }: CandyCardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'cookie-card p-4 sm:p-5',
        interactive &&
          'speed-line transition-transform duration-150 will-change-transform hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
