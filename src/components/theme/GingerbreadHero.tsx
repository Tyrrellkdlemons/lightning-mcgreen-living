import { GingerbreadApartment, GingerbreadTownhome } from './GingerbreadHouse';
import { LightningBolt } from './LightningBolt';

/**
 * Gingerbread-deep hero for the rentals section. Warm cream + frosting +
 * candy-stripe ribbon. Original — no Zillow blue-house glyph or other
 * branded assets.
 */
export function GingerbreadHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="gingerbread-shell mt-6">
      <div className="candy-ribbon" aria-hidden />
      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-gingerbread-300 bg-frosting-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gingerbread-700">
              <LightningBolt className="h-4" /> Cookie street · move-in zone
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-chocolate-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-chocolate-800 sm:text-base">{subtitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gingerbread-700">
              <span className="rounded-full border border-gingerbread-300 bg-frosting-50 px-2 py-1">SoCal-only</span>
              <span className="rounded-full border border-gingerbread-300 bg-frosting-50 px-2 py-1">Verified operators</span>
              <span className="rounded-full border border-gingerbread-300 bg-frosting-50 px-2 py-1">Screening insight</span>
            </div>
          </div>
          <div className="flex shrink-0 items-end gap-3">
            <GingerbreadApartment className="h-20 w-auto" />
            <GingerbreadTownhome className="h-20 w-auto" />
          </div>
        </div>
      </div>
      <div className="candy-icing-divider" aria-hidden />
    </section>
  );
}
