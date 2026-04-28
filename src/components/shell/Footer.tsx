import Link from 'next/link';
import { LightningBolt } from '@/components/theme/LightningBolt';
import { AsphaltStrip } from '@/components/theme/CheckeredDivider';

export function Footer() {
  return (
    <footer className="mt-12 pb-24 md:pb-10">
      <AsphaltStrip />
      <div className="mx-auto max-w-7xl px-4 pt-8 text-sm text-chocolate-700">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-base font-extrabold text-chocolate-800">
              <LightningBolt className="h-6" />
              Lightning McGreen Living
            </div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed">
              Southern California rentals + cars + work vehicles. We help
              prepare and compare. Final approval is controlled by the property,
              dealer, lender, or rental provider.
            </p>
          </div>

          <FooterCol title="Discover">
            <FooterLink href="/rentals">Apartments & Townhomes</FooterLink>
            <FooterLink href="/cars">Cars</FooterLink>
            <FooterLink href="/work-vehicles">Work Vehicles</FooterLink>
            <FooterLink href="/life-budget">Compare Life Budget</FooterLink>
          </FooterCol>

          <FooterCol title="Tools">
            <FooterLink href="/compare">Compare</FooterLink>
            <FooterLink href="/saved">Saved</FooterLink>
            <FooterLink href="/admin">Admin</FooterLink>
          </FooterCol>

          <FooterCol title="Help & trust">
            <FooterLink href="/assistance">Stay-housed + auto hardship</FooterLink>
            <FooterLink href="/templates">Printable letters</FooterLink>
            <FooterLink href="/data-sources">Data sources</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/accessibility">Accessibility</FooterLink>
          </FooterCol>
        </div>

        <p className="mt-8 border-t border-gingerbread-300/40 pt-4 text-xs leading-relaxed text-chocolate-700">
          Prices, promos, rates, and availability can change. Always verify with
          the property, dealer, or rental provider before applying, financing,
          reserving, or visiting. Lightning McGreen Living is an original
          project — not affiliated with Disney, Pixar, Cars, NASCAR, Zillow,
          Apartments.com, Rent.com, Cars.com, Autotrader, CarGurus, or any
          listed property manager / dealer / rental provider.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-chocolate-700">{title}</h3>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </div>
  );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-lightning-700">{children}</Link>
    </li>
  );
}
