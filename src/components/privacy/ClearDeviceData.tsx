'use client';
import { useState } from 'react';
const KEYS = ['lmgl:renter-profile', 'lmgl:buyer-profile', 'lmgl:work-rental-profile', 'lmgl:saved', 'lmgl:compare'];
export function ClearDeviceData() {
  const [message, setMessage] = useState('');
  function clear() {
    if (!window.confirm('Remove McGreen profiles, saved items and comparison choices from this browser? This cannot be undone. Other websites, browser history and downloaded files are not cleared.')) return;
    try {
      for (const key of KEYS) localStorage.removeItem(key);
      window.location.reload();
    } catch { setMessage('The browser could not clear all stored items. Use its site-data settings to remove this site’s data.'); }
  }
  return <section id="device-data" className="not-prose mt-8 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6"><h2 className="font-display text-xl font-bold">Using a shared device?</h2><p className="mt-3 text-sm leading-relaxed">Profiles, saved items and comparison choices remain in this browser after you close a page. Close other McGreen tabs before clearing them. Only this website’s five profile and planning entries are removed; accessibility and map preferences remain.</p><button type="button" onClick={clear} className="cinnamon-btn mt-4 min-h-11">Clear profiles, saved items &amp; comparison</button><p className="mt-3 text-sm">This does not clear browser history, downloaded letters, clipboard contents, other websites or records you submitted to a provider. Review those separately on a shared computer.</p>{message && <p role="status" className="mt-3 text-sm">{message}</p>}</section>;
}
