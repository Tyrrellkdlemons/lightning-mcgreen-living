import { LightningBolt } from './LightningBolt';
import { CookieCar, WorkVan } from './CookieCar';

/**
 * Race-day hero for the cars / work-vehicles section.
 *
 * Original motorsport-inspired styling: asphalt background, neon-green
 * lightning glow, checkered corner, lane-line speed stripe at the bottom.
 * Does NOT use Disney/Pixar Cars characters, NASCAR sponsor boards, or
 * the "95" race numbering — see docs/UI_THEME_GUIDE.md §11.
 */
export function RaceHero({
  title,
  subtitle,
  variant = 'cars',
}: {
  title: string;
  subtitle: string;
  variant?: 'cars' | 'work';
}) {
  return (
    <section className="race-shell mt-6 px-5 py-7 sm:px-8 sm:py-9">
      <div className="race-corner" aria-hidden />
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-lightning-300/60 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-lightning-300">
            <LightningBolt className="h-4" /> Race day · pit lane
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-frosting-50 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-frosting-100/85 sm:text-base">{subtitle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-lightning-300">
            <span className="tach">RPM · LIVE</span>
            <span className="rounded-full border border-lightning-300/40 bg-black/30 px-2 py-1">SoCal grid only</span>
            <span className="rounded-full border border-lightning-300/40 bg-black/30 px-2 py-1">Verified chains</span>
          </div>
        </div>
        <div className="flex shrink-0 items-end gap-3 drop-shadow-[0_0_12px_rgba(52,219,0,0.45)]">
          {variant === 'cars' ? (
            <>
              <CookieCar className="h-16 w-auto" />
              <CookieCar className="h-12 w-auto opacity-70" />
            </>
          ) : (
            <>
              <WorkVan className="h-16 w-auto" />
              <WorkVan className="h-12 w-auto opacity-70" />
            </>
          )}
        </div>
      </div>
      <div className="speed-stripe mt-6 rounded" aria-hidden />
      <div className="race-stripe" aria-hidden />
    </section>
  );
}
