import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm mx-auto mt-6 max-w-3xl text-chocolate-800">
      <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Privacy</h1>
      <p>
        Lightning McGreen Living is a discovery and qualification-prep tool. Everything you enter into
        a profile (renter, buyer, work-vehicle) is stored on your device first.
      </p>
      <h2>What we don&apos;t collect</h2>
      <ul>
        <li>We do not ask for your Social Security Number.</li>
        <li>We do not ask for full bank credentials.</li>
        <li>We do not pull your credit. The credit range field is self-selected and stays on your device.</li>
        <li>We do not store government-issued IDs unless secure storage and explicit consent are implemented.</li>
      </ul>
      <h2>What we may collect (only if you opt in)</h2>
      <ul>
        <li>Account email + an encrypted backup of your profile (if you create an account).</li>
        <li>Anonymous usage analytics (page views, events). No personally identifying data.</li>
      </ul>
      <h2>Third parties</h2>
      <p>
        When you click an &ldquo;Open official application&rdquo; or &ldquo;Open dealer&rdquo; / &ldquo;Open rental
        provider&rdquo; button, you leave our site. Their privacy policy applies from that point forward.
      </p>
      <h2>Contact</h2>
      <p>For privacy questions, file an issue in the project repository.</p>
    </article>
  );
}
