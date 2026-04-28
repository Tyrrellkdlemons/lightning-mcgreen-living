import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

export type GumdropTone = 'ok' | 'info' | 'warn' | 'mute';

export function Gumdrop({
  tone = 'info',
  children,
  className,
  title,
}: {
  tone?: GumdropTone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={cn('gumdrop', `gumdrop--${tone}`, className)}
      title={title}
    >
      {children}
    </span>
  );
}
