'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const url = '/service-worker.js';
    navigator.serviceWorker.register(url).catch(() => {/* swallow */});
  }, []);
  return null;
}
