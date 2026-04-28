# UI Theme Guide — Green Lightning Gingerbread Racing

## 1. Mood

Fast, helpful, magical, budget-smart. *"Inspired by friendly animated racing
films and professional motorsport dashboards."* Original. Legally distinct.
Never copies Disney/Pixar/NASCAR/Zillow/Cars.com/Autotrader assets.

## 2. Palette (Tailwind tokens)

| Token | Use |
| --- | --- |
| `lightning-500` (#34db00) | Primary "go" green; CTAs, bolts |
| `lightning-300` (#75ff45) | Glowing accent, hover states |
| `gingerbread-500` (#a86926) | Cookie surfaces, card border base |
| `gingerbread-700` (#5e3914) | Cookie shadow, deep border |
| `caramel-500` (#b8782a) | Frosting borders / highlights |
| `peppermint-500` (#ff4f5e) | Alerts, "verify" tags, candy stripe |
| `frosting-50/100/200` | Cream surfaces |
| `chocolate-700/800/900` | Asphalt road dividers, footer |

## 3. Surface system

- **Cookie card** (`<CandyCard>`) — `bg-frosting-50`, `border-2 border-gingerbread-300`,
  `rounded-cookie`, `shadow-cookie`. Used for properties, dealers, vehicles,
  rental options.
- **Glassy caramel panel** — translucent `bg-caramel-500/15` with frosting
  border. Used for filter sidebars and inline calculators.
- **Gumdrop badge** — `rounded-gumdrop bg-lightning-500 text-chocolate-900
  font-bold`. Used for fit-score, promo, and trust labels.
- **Cinnamon button** — `bg-gradient-to-b from-gingerbread-500 to-gingerbread-700
  text-frosting-50` with green-lightning glow on hover.
- **Chocolate-road divider** — full-width `bg-asphalt` strip with painted
  yellow lane stripes (CSS gradient, no image).
- **Checkered transition** — section transitions use `bg-checkered` strip;
  motion is gated by `prefers-reduced-motion`.

## 4. Iconography

Original SVGs only. Common motifs:

- ⚡ Green lightning bolt (single + clusters)
- 🏠 Tiny gingerbread apartment (3 frosting windows + door)
- 🏘 Tiny townhome row (2 stacked rectangles + chimney)
- 🚗 Cookie car silhouette (no winking eyes — that would touch the
  protected "Cars" character look)
- 🚐 Cargo van silhouette (work vehicle)
- 🥨 Gumdrop pin (map markers)
- 🏁 Checkered flag (section transitions)

## 5. Motion

- All "raining objects" use **CSS transforms only** (`translate3d`) — never
  layout-affecting properties.
- All raining objects pause when `prefers-reduced-motion: reduce` is set or
  when the user hits the "Reduce motion" toggle in the header.
- Framer Motion is reserved for **page/section** transitions, not for
  per-element ambient animation.
- No video backgrounds. No autoplay anywhere.
- Lighting effects (bolt-pulse) use `filter: drop-shadow(...)` only.

## 6. Mobile rules

- Bottom nav (4 items): Rentals · Cars · Work · Saved.
- Sticky "Filter" pill on search pages.
- Sticky "Save / Compare" buttons on detail pages.
- One-thumb forms — single-column layout under 640px, large tap targets
  (44px minimum).
- No horizontal scroll, ever. Lint rule blocks `overflow-x: scroll` outside
  the swipeable card carousel.

## 7. Desktop rules

- Split map/list with a sticky filter sidebar.
- Comparison grid up to 4 across, with horizontal pin/scroll for the 5th+.
- Hover previews open after 300 ms — never on `mousedown`.

## 8. Typography

- Display: a system-friendly heavy sans (e.g., Inter Variable 800), never a
  Disney-Cars-style typeface. Variable so we can ship one weight file and use
  it everywhere.
- Body: same family at 400/500.
- Numerals always tabular for prices and rates (`font-variant-numeric: tabular-nums`).

## 9. Copy voice

Friendly + budget-smart + transparent. Use labels like:

- *"Managed by"* / *"Application goes through"* / *"Documents likely needed"*
- *"Fees before move-in"* / *"Why this may fit"* / *"What could hurt approval"*
- *"Publicly verified promo"* / *"Needs verification"*
- *"Best vehicle for this job"* / *"Estimated rental cost"* / *"Verify availability"*

Never use vague hype like *"perfect for you!"* or *"steal of a deal!"*.

## 10. Reduce-motion contract

The header always shows a "Reduce motion" toggle. When ON (or when the OS
prefers reduced motion):

- All raining objects unmount.
- `bolt-pulse`, `speed-line`, `rain-fall` animations stop.
- Page transitions become instant fades.
- Hover micro-animations shorten to 0.

## 11. Brand do-not list (review checklist)

- ❌ No tongue-out cartoon car faces
- ❌ No "95" race numbering (Lightning McQueen reference)
- ❌ No NASCAR-style number panels
- ❌ No Disney/Pixar font lookalikes
- ❌ No Zillow blue-and-white house silhouette
- ❌ No Apartments.com diamond-A
- ❌ No Cars.com red badge
