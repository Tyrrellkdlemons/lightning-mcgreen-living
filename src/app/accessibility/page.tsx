import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Accessibility' };

export default function AccessibilityPage() {
  return (
    <article className="prose prose-sm mx-auto mt-6 max-w-3xl text-chocolate-800">
      <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Accessibility</h1>
      <p>
        We aim for WCAG 2.1 AA across the platform. The header has a
        &ldquo;Reduce motion&rdquo; toggle that hard-disables the raining objects, lightning
        pulse, and speed-line transitions. The OS-level{' '}
        <code>prefers-reduced-motion</code> setting is also honored.
      </p>
      <h2>What works today</h2>
      <ul>
        <li>Visible focus rings on every interactive element (3px lightning-green outline).</li>
        <li>Keyboard navigation across all forms, filters, and detail pages.</li>
        <li>Color contrast at 4.5:1 minimum for body text.</li>
        <li>All ambient SVG art has descriptive <code>aria-label</code>s.</li>
        <li>All icons that convey meaning have <code>title</code> or <code>aria-label</code>.</li>
        <li>Tabular numerals for prices, fees, payments.</li>
      </ul>
      <h2>Filters that are intentionally available</h2>
      <p>
        Accessibility-related filters: step-free entry, elevator, roll-in shower,
        wheelchair-accessible parking. These are explicit physical-feature filters,
        never a steering proxy.
      </p>
      <h2>Report an issue</h2>
      <p>
        If something doesn&apos;t work with your screen reader, keyboard, or other
        assistive tech, please file an issue in the repo with details.
      </p>
    </article>
  );
}
