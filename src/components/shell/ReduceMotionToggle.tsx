'use client';

import { useEffect, useState } from 'react';

/**
 * Header toggle that flips a CSS class on `<html>` and persists in
 * localStorage. RainingObjects + Framer transitions both honor it.
 */
export function ReduceMotionToggle() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const initial = localStorage.getItem('lmgl:reduce-motion') === '1';
    setReduce(initial);
    document.documentElement.classList.toggle('reduce-motion', initial);
  }, []);

  function toggle() {
    const next = !reduce;
    setReduce(next);
    localStorage.setItem('lmgl:reduce-motion', next ? '1' : '0');
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
