import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

const POINTS = [
  {
    title: 'Qualification fit, not vanity tags',
    body: "We score every listing against your real budget, income, and savings — and tell you exactly why it might fit (or not). No black-box approvals.",
    tone: 'ok' as const,
    label: 'Honest',
  },
  {
    title: 'Application process, in plain English',
    body: "We surface who manages the property, which application platform you'll land on (RentCafe / Entrata / AppFolio / RealPage / Knock), and the documents you'll need.",
    tone: 'info' as const,
    label: 'Transparent',
  },
  {
    title: 'Apartments AND townhomes',
    body: 'Filter to townhomes only, or both. See private entrance, attached garage, yard/patio, and levels at a glance.',
    tone: 'mute' as const,
    label: 'Townhome ready',
  },
  {
    title: 'Cars + work vehicles together',
    body: "Buy or finance a car, OR rent a cargo van / box truck / pickup for jobs. Compare both against your budget side-by-side.",
    tone: 'ok' as const,
    label: 'Two-in-one',
  },
  {
    title: 'Source-labeled. Verifiable.',
    body: "Every price, fee, promo, and availability claim carries a source URL, last-verified date, and trust label. Promos are 'Publicly verified' or 'Needs verification' — never invented.",
    tone: 'info' as const,
    label: 'Source-backed',
  },
  {
    title: 'Original. Legally distinct.',
    body: "Green-lightning gingerbread racing world — inspired by friendly animated racing films and motorsport dashboards. We never copy Disney/Pixar, NASCAR, Zillow, Apartments.com, or Cars.com assets.",
    tone: 'mute' as const,
    label: 'Original',
  },
];

export function WhyBetter() {
  return (
    <section className="mt-10" aria-label="Why this is better than Zillow / Apartments.com / Cars.com">
      <h2 className="font-display text-xl font-extrabold text-chocolate-900 sm:text-2xl">
        Better than Zillow, Apartments.com, Cars.com — without copying any of them.
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-chocolate-700">
        Six things we do differently. (See <a href="/data-sources" className="underline decoration-lightning-500 underline-offset-4">data sources</a> for how each listing is verified.)
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POINTS.map((p) => (
          <li key={p.title}>
            <CandyCard className="h-full">
              <Gumdrop tone={p.tone}>{p.label}</Gumdrop>
              <h3 className="mt-2 text-base font-bold text-chocolate-900">{p.title}</h3>
              <p className="mt-1 text-sm text-chocolate-700">{p.body}</p>
            </CandyCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
