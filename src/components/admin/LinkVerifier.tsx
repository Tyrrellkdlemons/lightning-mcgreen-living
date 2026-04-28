'use client';

import { useEffect, useMemo, useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { REAL_VEHICLES, REAL_DEALERS } from '@/lib/data/real-vehicles';
import { REAL_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';
import { resolveApartmentApplicationLink, resolveVehicleFinanceLink, resolveWorkRentalReservationLink } from '@/lib/links/resolver';

type Status =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'ok'; status: number; checked_at: string; final_url?: string; redirected?: boolean }
  | { state: 'fail'; status: number; reason: string; checked_at: string }
  | { state: 'blocked'; reason: string };

interface Row {
  id: string;
  kind: 'rental' | 'vehicle' | 'work-vehicle';
  title: string;
  href: string | null;
  link_type: string;
  link_confidence: string;
}

type Notes = Record<string, { manual_verified_at?: string; note?: string }>;

const STORAGE = 'lmgl:link-verify-log';

export function LinkVerifier() {
  const [secret, setSecret] = useState('');
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [notes, setNotes] = useState<Notes>({});
  const [filter, setFilter] = useState<'all' | 'rental' | 'vehicle' | 'work-vehicle'>('all');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
  }, []);

  const rows: Row[] = useMemo(() => {
    const rentalRows: Row[] = REAL_RENTALS.map((r) => {
      const l = resolveApartmentApplicationLink(r as any);
      return { id: `rental:${r.id}`, kind: 'rental', title: `${r.property_name} · ${r.city}`, href: l.url, link_type: l.kind, link_confidence: l.confidence };
    });
    const dealerById = new Map(REAL_DEALERS.map((d) => [d.id, d]));
    const vehicleRows: Row[] = REAL_VEHICLES.map((v) => {
      const l = resolveVehicleFinanceLink(v as any, dealerById.get(v.dealer_id));
      return { id: `vehicle:${v.id}`, kind: 'vehicle', title: `${v.year} ${v.make} ${v.model}`, href: l.url, link_type: l.kind, link_confidence: l.confidence };
    });
    const workRows: Row[] = REAL_WORK_VEHICLES.map((w) => {
      const l = resolveWorkRentalReservationLink(w as any);
      return { id: `work-vehicle:${w.id}`, kind: 'work-vehicle', title: `${w.provider_name} · ${w.city}`, href: l.url, link_type: l.kind, link_confidence: l.confidence };
    });
    return [...rentalRows, ...vehicleRows, ...workRows];
  }, []);

  const visible = filter === 'all' ? rows : rows.filter((r) => r.kind === filter);

  async function checkOne(row: Row) {
    if (!row.href) {
      setStatuses((s) => ({ ...s, [row.id]: { state: 'fail', status: 0, reason: 'no link', checked_at: new Date().toISOString() } }));
      return;
    }
    setStatuses((s) => ({ ...s, [row.id]: { state: 'checking' } }));
    try {
      const res = await fetch(`/api/admin/link-check?url=${encodeURIComponent(row.href)}`, {
        headers: { 'x-admin-secret': secret },
      });
      const json = await res.json();
      if (json.blocked) {
        setStatuses((s) => ({ ...s, [row.id]: { state: 'blocked', reason: json.reason } }));
      } else if (json.ok) {
        setStatuses((s) => ({ ...s, [row.id]: { state: 'ok', status: json.status, final_url: json.final_url, redirected: json.redirected, checked_at: json.checked_at } }));
      } else {
        setStatuses((s) => ({ ...s, [row.id]: { state: 'fail', status: json.status ?? 0, reason: json.error ?? 'failed', checked_at: json.checked_at ?? new Date().toISOString() } }));
      }
    } catch (e: any) {
      setStatuses((s) => ({ ...s, [row.id]: { state: 'fail', status: 0, reason: e?.message ?? 'request failed', checked_at: new Date().toISOString() } }));
    }
  }

  async function checkAll() {
    for (const r of visible) {
      await checkOne(r);
      // be polite — small delay between probes
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  function manualVerify(id: string) {
    const next = { ...notes, [id]: { ...(notes[id] ?? {}), manual_verified_at: new Date().toISOString() } };
    setNotes(next);
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch {}
  }

  function setNote(id: string, note: string) {
    const next = { ...notes, [id]: { ...(notes[id] ?? {}), note } };
    setNotes(next);
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch {}
  }

  return (
    <CandyCard className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-chocolate-700">x-admin-secret</span>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="paste your ADMIN_SHARED_SECRET"
            className="mt-1 w-72 rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-chocolate-700">Filter</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="mt-1 rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="rental">Rentals</option>
            <option value="vehicle">Cars</option>
            <option value="work-vehicle">Work vehicles</option>
          </select>
        </label>
        <button type="button" onClick={checkAll} disabled={!secret} className="bolt-btn text-sm disabled:opacity-50">
          Check all visible
        </button>
        <span className="text-xs text-chocolate-700">
          <strong>{visible.length}</strong> of {rows.length} entries
        </span>
      </div>

      <div className="mt-4 max-h-[60vh] overflow-y-auto thin-scroll">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-frosting-100 text-xs uppercase tracking-wider text-chocolate-700">
            <tr>
              <th className="p-2 text-left">Kind</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Resolved link type</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Manual</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const st = statuses[row.id] ?? { state: 'idle' };
              const tone =
                st.state === 'ok' ? 'ok' :
                st.state === 'checking' ? 'info' :
                st.state === 'blocked' ? 'mute' :
                st.state === 'fail' ? 'warn' : 'mute';
              const note = notes[row.id];
              return (
                <tr key={row.id} className="border-b border-gingerbread-300/30 align-top">
                  <td className="p-2"><Gumdrop tone="mute">{row.kind}</Gumdrop></td>
                  <td className="p-2 max-w-[280px] truncate" title={row.title}>{row.title}</td>
                  <td className="p-2 text-xs">
                    {row.link_type}<br />
                    <span className="text-chocolate-600">conf: {row.link_confidence}</span>
                  </td>
                  <td className="p-2">
                    <Gumdrop tone={tone as any}>
                      {st.state === 'idle' && '— not checked —'}
                      {st.state === 'checking' && 'checking…'}
                      {st.state === 'ok' && `OK · ${st.status}${st.redirected ? ' (redir)' : ''}`}
                      {st.state === 'blocked' && 'blocked host'}
                      {st.state === 'fail' && `FAIL · ${st.status || st.reason}`}
                    </Gumdrop>
                    <button type="button" onClick={() => checkOne(row)} disabled={!secret}
                            className="ml-2 rounded-full border border-gingerbread-300 bg-white px-2 py-0.5 text-[11px] disabled:opacity-50">
                      Re-check
                    </button>
                    {row.href && (
                      <a href={row.href} target="_blank" rel="noopener noreferrer"
                         className="ml-2 text-[11px] underline decoration-lightning-500 underline-offset-2">open ↗</a>
                    )}
                  </td>
                  <td className="p-2">
                    <button type="button" onClick={() => manualVerify(row.id)}
                            className="rounded-full border border-lightning-500 bg-lightning-100 px-2 py-0.5 text-[11px] font-bold text-lightning-700">
                      ✓ verified
                    </button>
                    {note?.manual_verified_at && (
                      <p className="mt-1 text-[10px] text-chocolate-600">at {note.manual_verified_at.slice(0, 10)}</p>
                    )}
                    <input
                      placeholder="note"
                      defaultValue={note?.note ?? ''}
                      onBlur={(e) => setNote(row.id, e.target.value)}
                      className="mt-1 w-44 rounded border border-gingerbread-300 bg-white px-1.5 py-0.5 text-[11px]"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CandyCard>
  );
}
