import Link from 'next/link';
import { GingerbreadApartment, GingerbreadTownhome } from '@/components/theme/GingerbreadHouse';
import { CookieCar, WorkVan } from '@/components/theme/CookieCar';
import { LightningBolt } from '@/components/theme/LightningBolt';

/**
 * The two prominent "doors" on the homepage.
 *
 * LEFT  — Apartments & Townhomes  →  /rentals
 * RIGHT — Cars & Work Vehicles    →  /cars (with toggle to work vehicles)
 *
 * On mobile they stack; on md+ they sit side by side with the asphalt road
 * between them.
 */
export function TwoDoors() {
  return (
    <section className="relative grid gap-6 md:grid-cols-2 md:gap-8" aria-label="Two main doors">
      {/* LEFT — rentals */}
      <Link
        href="/rentals"
        className="group cookie-card block p-6 sm:p-8 transition-transform duration-150 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-lightning-300"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-chocolate-900">
            Apartments &amp; Townhomes
          </h2>
          <LightningBolt className="h-6 opacity-70 group-hover:opacity-100" />
        </div>
        <p className="mt-2 text-sm text-chocolate-700">
          Find Southern California rentals you are more likely to qualify for.
        </p>
        <div className="mt-6 flex items-end gap-3">
          <GingerbreadApartment className="h-20 w-auto" />
          <GingerbreadTownhome className="h-20 w-auto" />
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-chocolate-800">
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Move-in cost calc</li>
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Application platform</li>
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Income fit</li>
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Townhome filter</li>
        </ul>
        <div className="mt-6">
          <span className="bolt-btn inline-flex items-center gap-2">
            Start Rental Match <span aria-hidden>→</span>
          </span>
        </div>
      </Link>

      {/* RIGHT — vehicles */}
      <Link
        href="/cars"
        className="group cookie-card block p-6 sm:p-8 transition-transform duration-150 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-lightning-300"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-chocolate-900">
            Cars &amp; Work Vehicles
          </h2>
          <LightningBolt className="h-6 opacity-70 group-hover:opacity-100" />
        </div>
        <p className="mt-2 text-sm text-chocolate-700">
          Find Southern California dealers, promos, cars, and work vehicles that
          fit your real budget.
        </p>
        <div className="mt-6 flex items-end gap-3">
          <CookieCar className="h-20 w-auto" />
          <WorkVan className="h-20 w-auto" />
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-chocolate-800">
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Payment estimator</li>
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Dealer transparency</li>
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Work vehicle rentals</li>
          <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Job-to-vehicle match</li>
        </ul>
        <div className="mt-6">
          <span className="bolt-btn inline-flex items-center gap-2">
            Start Vehicle Match <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </section>
  );
}
