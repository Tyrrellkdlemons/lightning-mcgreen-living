'use client';
import {useHydrated} from '@/lib/client/state';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Heart, Columns2 } from 'lucide-react';
import { useCompareStore, useSavedStore } from '@/lib/store/compare';

export function RentalPlanningActions({ id, name }: { id: string; name: string }) {
  const saved = useSavedStore((state) => state.has('rental', id));
  const compared = useCompareStore((state) => state.has('rental', id));
  const ready = useHydrated();
  const [message, setMessage] = useState('');

  function toggleSaved() {
    const store = useSavedStore.getState();
    const removing = store.has('rental', id);
    store.toggle('rental', id);
    setMessage(removing ? 'Removed from Saved on this device.' : 'Saved on this device.');
  }

  function toggleCompare() {
    // Re-read the store at click time so rapid clicks and other cards respect
    // the existing eight-item limit, including cars and work vehicles.
    const store = useCompareStore.getState();
    if (store.has('rental', id)) {
      store.remove('rental', id);
      setMessage('Removed from Compare. Your saved list is unchanged.');
    } else if (store.items.length >= 8) {
      setMessage('Compare is full. Remove an item from Compare to add this home.');
    } else {
      store.add('rental', id);
      setMessage('Added to Compare on this device.');
    }
  }

  return (
    <div className="rental-planning">
      <div className="rental-planning-buttons">
        <button type="button" disabled={!ready} onClick={toggleSaved} aria-pressed={ready && saved}
          aria-label={`${ready && saved ? 'Remove' : 'Save'} ${name}${ready && saved ? ' from Saved' : ''}`}>
          <Heart aria-hidden="true" size={18} fill={ready && saved ? 'currentColor' : 'none'} />
          {ready && saved ? 'Saved' : 'Save'}
        </button>
        <button type="button" disabled={!ready} onClick={toggleCompare} aria-pressed={ready && compared}
          aria-label={`${ready && compared ? 'Remove' : 'Add'} ${name} ${ready && compared ? 'from' : 'to'} Compare`}>
          {ready && compared ? <Check aria-hidden="true" size={18} /> : <Columns2 aria-hidden="true" size={18} />}
          {ready && compared ? 'In Compare' : 'Compare'}
        </button>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="rental-planning-status">{message}</p>
      {message.startsWith('Compare is full') && <Link href="/compare" className="rental-planning-link">Manage your comparison</Link>}
    </div>
  );
}
