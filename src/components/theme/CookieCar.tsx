import { cn } from '@/lib/utils/cn';

/**
 * Cookie car — generic, friendly silhouette. Intentionally has NO
 * tongue-out grin, NO eyes on the windshield, NO racing number, and NO
 * resemblance to any protected character (e.g. Pixar "Cars").
 */
export function CookieCar({
  className,
  title = 'Cookie car silhouette',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-auto', className)}
    >
      <defs>
        <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34db00" />
          <stop offset="100%" stopColor="#1a7d04" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="60" cy="58" rx="48" ry="3" fill="rgba(0,0,0,0.18)" />
      {/* body */}
      <path
        d="M8 48 Q8 36 22 32 L34 22 Q40 16 50 16 L74 16 Q86 16 96 26 L108 32 Q116 36 116 48 L116 50 Q116 54 110 54 L14 54 Q8 54 8 50 Z"
        fill="url(#car-body)"
        stroke="#0c3a02"
        strokeWidth="2"
      />
      {/* windshield + cabin glass */}
      <path
        d="M40 22 L74 22 Q84 22 90 30 L60 30 L40 30 Z"
        fill="#dff3ff"
        stroke="#0c3a02"
        strokeWidth="1.5"
      />
      {/* lightning side stripe (original, not "95") */}
      <path
        d="M28 42 L42 36 L36 44 L52 40"
        stroke="#fffaf0"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* wheels */}
      <circle cx="32" cy="54" r="8" fill="#1a0d05" stroke="#fffaf0" strokeWidth="2" />
      <circle cx="32" cy="54" r="2.5" fill="#fffaf0" />
      <circle cx="92" cy="54" r="8" fill="#1a0d05" stroke="#fffaf0" strokeWidth="2" />
      <circle cx="92" cy="54" r="2.5" fill="#fffaf0" />
    </svg>
  );
}

/** Work van — boxy, original silhouette. */
export function WorkVan({
  className,
  title = 'Work van silhouette',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-10 w-auto', className)}
    >
      <defs>
        <linearGradient id="van-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3dc" />
          <stop offset="100%" stopColor="#dca257" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="58" rx="50" ry="3" fill="rgba(0,0,0,0.18)" />
      <path
        d="M8 50 L8 28 Q8 22 14 22 L80 22 L100 36 L112 38 Q116 38 116 42 L116 50 Q116 54 110 54 L14 54 Q8 54 8 50 Z"
        fill="url(#van-body)"
        stroke="#5e3914"
        strokeWidth="2"
      />
      {/* cabin window */}
      <rect x="78" y="26" width="20" height="12" rx="2" fill="#dff3ff" stroke="#5e3914" strokeWidth="1.5" />
      {/* side window */}
      <rect x="22" y="28" width="48" height="12" rx="2" fill="#dff3ff" stroke="#5e3914" strokeWidth="1.5" />
      {/* lightning company stripe */}
      <path d="M22 44 L42 38 L36 46 L60 40" stroke="#34db00" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* wheels */}
      <circle cx="32" cy="54" r="8" fill="#1a0d05" stroke="#fffaf0" strokeWidth="2" />
      <circle cx="32" cy="54" r="2.5" fill="#fffaf0" />
      <circle cx="92" cy="54" r="8" fill="#1a0d05" stroke="#fffaf0" strokeWidth="2" />
      <circle cx="92" cy="54" r="2.5" fill="#fffaf0" />
    </svg>
  );
}
