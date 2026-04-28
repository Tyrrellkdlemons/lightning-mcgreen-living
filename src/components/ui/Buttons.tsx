import { cn } from '@/lib/utils/cn';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

interface BoltButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
interface CinnamonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function BoltButton({ className, children, ...rest }: BoltButtonProps) {
  return (
    <button {...rest} className={cn('bolt-btn', className)}>
      {children}
    </button>
  );
}

export function CinnamonButton({ className, children, ...rest }: CinnamonButtonProps) {
  return (
    <button {...rest} className={cn('cinnamon-btn', className)}>
      {children}
    </button>
  );
}

export function BoltLink({
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} className={cn('bolt-btn inline-flex items-center gap-2', className)}>
      {children}
    </a>
  );
}

export function CinnamonLink({
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} className={cn('cinnamon-btn inline-flex items-center gap-2', className)}>
      {children}
    </a>
  );
}
