'use client';
import {useHydrated} from '@/lib/client/state';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { REAL_DEALERS, REAL_VEHICLES } from '@/lib/data/real-vehicles';
import { REAL_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';
import { useCompareStore, useSavedStore } from '@/lib/store/compare';
import { PLANNING_GROUPS, resolvePlanningItem, type PlanningCatalog, type PlanningRecord, type PlanningSelection } from './model';

const catalog: PlanningCatalog = { rentals: REAL_RENTALS, vehicles: REAL_VEHICLES, workVehicles: REAL_WORK_VEHICLES, dealers: REAL_DEALERS };
const COMPARE_LIMIT = 8;

export function PlanningList({ mode }: { mode: 'saved' | 'compare' }) {
  const saved = useSavedStore((state) => state.ids);
  const toggleSaved = useSavedStore((state) => state.toggle);
  const compared = useCompareStore((state) => state.items);
  const addCompared = useCompareStore((state) => state.add);
  const removeCompared = useCompareStore((state) => state.remove);
  const ready = useHydrated();
  const [notice, setNotice] = useState('');
  // Persisted browser state may differ from the server's empty store.
  // Keep the server and first client render identical before displaying it.
  const selections = mode === 'saved' ? saved : compared;
  const records = ready ? selections.map((selection) => ({ selection, record: resolvePlanningItem(selection, catalog) })) : [];
  const missing = records.filter((entry) => !entry.record);
  const remove = (selection: PlanningSelection) => {
    if (mode === 'saved') toggleSaved(selection.kind, selection.id);
    else removeCompared(selection.kind, selection.id);
    setNotice(mode === 'saved' ? 'Removed from saved items.' : 'Removed from comparison.');
  };
  const add = (selection: PlanningSelection) => {
    const current = useCompareStore.getState();
    if (current.has(selection.kind, selection.id)) return;
    if (current.items.length >= COMPARE_LIMIT) { setNotice('Comparison is full. Remove an item on Compare to make room.'); return; }
    addCompared(selection.kind, selection.id);
    setNotice('Added to comparison.');
  };
  function actions(selection: PlanningSelection, record: PlanningRecord) {
    const alreadyCompared = compared.some((item) => item.kind === selection.kind && item.id === selection.id);
    return <>
      <Link href={record.href} className="bolt-btn min-h-11 text-sm">View details</Link>
      {mode === 'saved' && (alreadyCompared ? <Link href="/compare" className="cinnamon-btn min-h-11 text-sm">In comparison</Link> : <button type="button" onClick={() => add(selection)} disabled={compared.length >= COMPARE_LIMIT} className="cinnamon-btn min-h-11 text-sm disabled:cursor-not-allowed disabled:opacity-50">{compared.length >= COMPARE_LIMIT ? 'Comparison full' : 'Add to compare'}</button>)}
      <button type="button" onClick={() => remove(selection)} aria-label={`Remove ${record.title} from ${mode === 'saved' ? 'saved items' : 'comparison'}`} className="min-h-11 rounded-lg px-3 text-sm font-bold text-chocolate-700 underline">Remove</button>
    </>;
  }
  return <div className="mt-6 min-w-0 [overflow-wrap:anywhere]">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-4 text-sm text-chocolate-700">
      <p>Stored on this device in this browser. <Link href="/privacy#device-data" className="font-bold underline">Manage device data</Link></p>
      <Link href={mode === 'saved' ? '/compare' : '/saved'} className="cinnamon-btn min-h-11 text-sm">{mode === 'saved' ? 'Open comparison' : 'Open saved items'}</Link>
    </div>
    <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-chocolate-700">{notice}</p>
    {!ready ? <p role="status" className="py-8 text-sm text-chocolate-700">Loading selections from this device…</p> : selections.length === 0 ? <EmptyPlanning mode={mode} /> : <>
      <p className="text-sm text-chocolate-700">{selections.length} {mode === 'saved' ? 'saved item' : 'comparison item'}{selections.length === 1 ? '' : 's'}{mode === 'compare' ? ` · Up to ${COMPARE_LIMIT} items` : ''}.</p>
      {mode === 'saved' && compared.length >= COMPARE_LIMIT && <p className="mt-2 text-sm text-chocolate-700">Comparison has {compared.length} items. Remove one on <Link href="/compare" className="font-bold underline">Compare</Link> to add another.</p>}
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-chocolate-700">Amounts and source dates come from the directory records. Confirm current prices, availability and fees with the provider. Rentals, purchase prices and daily rates are shown separately.</p>
      {PLANNING_GROUPS.map((group) => {
        const entries = records.filter((entry) => entry.record?.kind === group.kind);
        if (!entries.length) return null;
        return <section key={group.kind} className="mt-7" aria-labelledby={`${mode}-${group.kind}-title`}>
          <h2 id={`${mode}-${group.kind}-title`} className="section-heading">{group.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-700">{group.note}</p>
          <ul className={`mt-4 grid min-w-0 gap-4 md:grid-cols-2 ${mode === 'compare' ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
            {entries.map(({ selection, record }, index) => <li key={`${selection.kind}:${selection.id}:${index}`} className="min-w-0"><PlanningCard record={record!}>{actions(selection, record!)}</PlanningCard></li>)}
          </ul>
        </section>;
      })}
      {missing.length > 0 && <section className="mt-7" aria-labelledby={`${mode}-missing-title`}>
        <h2 id={`${mode}-missing-title`} className="section-heading">Records no longer in the directory</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">{missing.map(({ selection }, index) => <li key={`missing:${selection.kind}:${selection.id}:${index}`} className="min-w-0 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-5">
          <h3 className="font-bold text-chocolate-900">Saved record unavailable</h3><p className="mt-2 text-sm text-chocolate-700">This selection is still stored here, but its details are no longer in the current directory.</p>
          <p className="mt-2 break-all text-xs text-chocolate-600">{selection.kind} · {selection.id}</p>
          <button type="button" onClick={() => remove(selection)} aria-label={`Remove missing ${selection.kind} record ${selection.id}`} className="cinnamon-btn mt-4 min-h-11 text-sm">Remove unavailable record</button>
        </li>)}</ul>
      </section>}
    </>}
  </div>;
}

function PlanningCard({ record, children }: { record: PlanningRecord; children: ReactNode }) {
  return <article className="explore-card flex h-full min-w-0 flex-col p-5">
    <p className="text-xs font-bold uppercase tracking-wide text-chocolate-600">{record.category}</p>
    <h3 className="mt-2 break-words font-display text-xl font-extrabold text-chocolate-900"><Link href={record.href} className="underline decoration-lightning-500 underline-offset-4">{record.title}</Link></h3>
    <p className="mt-2 text-sm text-chocolate-700">{record.location}</p>
    <div className="mt-4 rounded-xl bg-frosting-100 p-3"><p className="text-xs font-bold text-chocolate-700">{record.costLabel}</p><p className="mt-1 text-xl font-extrabold text-chocolate-900">{record.cost}</p></div>
    <dl className="mt-4 flex-1 divide-y divide-gingerbread-200">{record.details.map((detail) => <div key={detail.label} className="py-2 text-sm"><dt className="font-semibold text-chocolate-700">{detail.label}</dt><dd className="mt-1 text-chocolate-900">{detail.value}</dd></div>)}</dl>
    <div className="mt-4 border-t border-gingerbread-200 pt-3 text-xs leading-relaxed text-chocolate-700"><p>Source date on record: {record.sourceDate}</p><p className="mt-1">{record.sourceNote}</p></div>
    <div className="mt-4 flex flex-wrap gap-2">{children}</div>
  </article>;
}

function EmptyPlanning({ mode }: { mode: 'saved' | 'compare' }) {
  return <div className="rounded-2xl border border-gingerbread-300 bg-white p-6 sm:p-8">
    <h2 className="section-heading">{mode === 'saved' ? 'Your saved list is empty' : 'Choose something to compare'}</h2>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-chocolate-700">{mode === 'saved' ? 'Use the heart-shaped Save button on a rental, car or work-vehicle card. Come back here to review it or add it to a comparison.' : 'Save listings with the heart button, then use Add to compare on your saved list. Compare up to 8 items, grouped by category.'}</p>
    <div className="mt-5 flex flex-wrap gap-3">{mode === 'compare' && <Link href="/saved" className="bolt-btn min-h-11">Open saved items</Link>}<Link href="/rentals" className="cinnamon-btn min-h-11">Browse rentals</Link><Link href="/cars" className="cinnamon-btn min-h-11">Browse cars</Link><Link href="/work-vehicles" className="cinnamon-btn min-h-11">Browse work vehicles</Link></div>
  </div>;
}
