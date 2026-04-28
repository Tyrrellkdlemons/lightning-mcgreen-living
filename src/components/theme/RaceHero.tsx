import { LightningBolt } from './LightningBolt';
import { CookieCar, WorkVan } from './CookieCar';
import { RacePad, PitLaneLeds, SpeedTicker, TireTreadDivider } from './RaceAccents';

/**
 * Race-day hero — x10 detail. All original. NO Disney/Pixar Cars / NASCAR
 * assets. The numbered race pad is "MG-7" / "MG-21" / etc., never "95".
 *
 * Layers:
 *   - asphalt-dark gradient
 *   - neon-green checkered corner
 *   - original race pad numbered badge
 *   - tachometer "RPM · LIVE" pill (already from previous pass)
 *   - pit-lane LED row
 *   - sliding marquee speed-ticker
 *   - tire-tread animated divider
 *   - speed stripe at the bottom
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
  const racePad = variant === 'cars' ? 'MG-7' : 'MG-21';
  const tickerItems = variant === 'cars'
    ? [
        'Pit lane open · 16 vehicles',
        'CarMax · Carvana · AutoNation · Driveway · EchoPark',
        'Honest payment math · no zero-down fakes',
        'NHTSA safety + recalls live · vPIC VIN decode',
        'Race-day theme · original · not affiliated with Cars/NASCAR',
      ]
    : [
        'Service lane open · 12 work vehicles',
        'U-Haul · Penske · Enterprise · Home Depot · Ryder · Budget · Fluid',
        'Daily / weekly / monthly cost calculator',
        'Job-to-vehicle matcher · cargo van / box truck / pickup / flatbed',
        'Reserve through official provider · we never auto-book',
      ];

  return (
    <section className="race-shell mt-6 px-5 py-7 sm:px-8 sm:py-9">
      <div className="race-corner" aria-hidden />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
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
              <PitLaneLeds />
              <span className="rounded-full border border-lightning-300/40 bg-black/30 px-2 py-1">SoCal grid only</span>
              <span className="rounded-full border border-lightning-300/40 bg-black/30 px-2 py-1">Verified chains</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <RacePad number={racePad} />
            <div className="flex items-end gap-3 drop-shadow-[0_0_12px_rgba(52,219,0,0.45)]">
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
        </div>
        <SpeedTicker items={tickerItems} className="mt-6" />
      </div>
      <TireTreadDivider className="mt-4" />
      <div className="race-stripe" aria-hidden />
    </section>
  );
}
