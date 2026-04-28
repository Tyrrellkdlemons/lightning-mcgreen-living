/**
 * Thin checkered-flag divider strip used between sections.
 * Pure CSS; no images.
 */
export function CheckeredDivider({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-hidden
      className={
        'h-3 w-full bg-checkered ' +
        'border-y border-chocolate-900/30 ' +
        (className ?? '')
      }
    />
  );
}

/**
 * Asphalt strip with painted yellow lane stripes — used as a visual road
 * between rental and vehicle sections.
 */
export function AsphaltStrip({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-hidden
      className={'asphalt-strip h-6 w-full ' + (className ?? '')}
    />
  );
}
