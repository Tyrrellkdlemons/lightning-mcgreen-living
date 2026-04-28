import { LightningBolt } from '@/components/theme/LightningBolt';

export function Hero() {
  return (
    <section className="relative pt-8 sm:pt-12 pb-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-gingerbread-300/60 bg-frosting-100 px-3 py-1 text-xs font-semibold text-gingerbread-700">
        <LightningBolt className="h-4" />
        Southern California · gingerbread streets · racing energy
      </div>

      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-chocolate-900 sm:text-5xl">
        Find a place to <span className="text-lightning-600">live</span>,
        a car to <span className="text-lightning-600">drive</span>,
        a van to <span className="text-lightning-600">earn</span>.
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm text-chocolate-700 sm:text-base">
        Lightning McGreen Living helps you discover apartments, townhomes, cars,
        dealers, and work vehicles you are more likely to qualify for —
        with honest fees, real application steps, and a sweet little theme.
      </p>

      <p className="mx-auto mt-3 max-w-2xl text-xs text-chocolate-600">
        We are not a property manager, dealer, lender, or rental booking
        service. We help prepare and compare; final approval is controlled by
        the property, dealer, lender, or rental provider.
      </p>
    </section>
  );
}
