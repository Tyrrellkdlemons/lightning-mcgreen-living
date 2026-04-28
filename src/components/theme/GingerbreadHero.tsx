import { GingerbreadApartment, GingerbreadTownhome } from './GingerbreadHouse';
import { LightningBolt } from './LightningBolt';
import { ChimneySmokeWrap, CookieEmbossWrap } from './GingerbreadAccents';

/**
 * Gingerbread-deep hero — x10 polish.
 *
 * Layers:
 *   - cream + frosting radial gradients
 *   - dashed cookie border ring
 *   - candy-stripe ribbon header
 *   - embossed cookie texture
 *   - animated chimney smoke on the apartment + townhome icons
 *   - subtle gumdrop-rain overlay (red + green dots, 2 falling streams)
 *   - candy-icing scalloped divider footer
 */
export function GingerbreadHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <CookieEmbossWrap className="gingerbread-shell mt-6 gumdrop-rain">
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
              <span className="rounded-full border border-gingerbread-300 bg-frosting-50 px-2 py-1">Direct application links</span>
            </div>
          </div>
          <div className="flex shrink-0 items-end gap-3">
            <ChimneySmokeWrap>
              <GingerbreadApartment className="h-20 w-auto" />
            </ChimneySmokeWrap>
            <ChimneySmokeWrap>
              <GingerbreadTownhome className="h-20 w-auto" />
            </ChimneySmokeWrap>
          </div>
        </div>
      </div>
      <div className="candy-icing-divider" aria-hidden />
    </CookieEmbossWrap>
  );
}
