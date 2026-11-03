'use client';

import { useEffect } from 'react';
import {useStorageValue,writeStorage} from '@/lib/client/state';

/**
 * Header toggle that flips a CSS class on `<html>` and persists in
 * localStorage. RainingObjects + Framer transitions both honor it.
 */
export function ReduceMotionToggle() {
  const reduce = useStorageValue('lmgl:reduce-motion') === '1';

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduce);
  }, [reduce]);

  function toggle() {
    const next = !reduce;
    try { writeStorage('lmgl:reduce-motion', next ? '1' : '0'); } catch {}
    document.documentElement.classList.toggle('reduce-motion', next);
    window.dispatchEvent(new Event('lmgl:reduce-motion-change'));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reduce}
      className="rounded-full border border-gingerbread-300 bg-frosting-100 px-3 py-1.5 text-xs font-semibold text-gingerbread-700 hover:bg-frosting-200"
      title="Toggle ambient animations"
    >
      {reduce ? 'Motion: off' : 'Motion: on'}
    </button>
  );
}
