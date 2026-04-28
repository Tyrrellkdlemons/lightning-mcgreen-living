import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <article className="prose prose-sm mx-auto mt-6 max-w-3xl text-chocolate-800">
      <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Terms</h1>
      <p>
        Lightning McGreen Living is a discovery and preparation tool for Southern California
        rentals, vehicles, and work-vehicle rentals. We are not a property manager, dealer,
        lender, screening provider, or rental booking system.
      </p>
      <h2>No guarantees</h2>
      <p>
        We do not guarantee housing approval, vehicle financing approval, &ldquo;zero-down&rdquo;
        eligibility, vehicle availability, rental availability, or work income.
      </p>
      <h2>Brand</h2>
      <p>
        &ldquo;Lightning McGreen Living&rdquo; is an original project, not affiliated with Disney,
        Pixar, the Cars franchise, NASCAR, Zillow, Apartments.com, Rent.com, Cars.com,
        Autotrader, CarGurus, or any property manager / dealer / rental provider.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use the platform to scrape protected listings, evade rate limits, or steer
        renters/buyers based on Fair Housing protected characteristics.
      </p>
    </article>
  );
}
