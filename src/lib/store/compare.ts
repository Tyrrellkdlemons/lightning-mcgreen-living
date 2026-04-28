import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CompareKind = 'rental' | 'car' | 'work-vehicle';

interface CompareItem {
  kind: CompareKind;
  id: string;
  added_at: string;
}

interface CompareState {
  items: CompareItem[];
  add: (kind: CompareKind, id: string) => void;
  remove: (kind: CompareKind, id: string) => void;
  clear: () => void;
  has: (kind: CompareKind, id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (kind, id) => {
        if (get().has(kind, id) || get().items.length >= 8) return;
        set({ items: [...get().items, { kind, id, added_at: new Date().toISOString() }] });
      },
      remove: (kind, id) => set({ items: get().items.filter((i) => !(i.kind === kind && i.id === id)) }),
      clear: () => set({ items: [] }),
      has: (kind, id) => get().items.some((i) => i.kind === kind && i.id === id),
    }),
    { name: 'lmgl:compare' },
  ),
);

interface SavedState {
  ids: { kind: CompareKind; id: string }[];
  toggle: (kind: CompareKind, id: string) => void;
  has: (kind: CompareKind, id: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (kind, id) => {
        const next = get().has(kind, id)
          ? get().ids.filter((i) => !(i.kind === kind && i.id === id))
          : [...get().ids, { kind, id }];
        set({ ids: next });
      },
      has: (kind, id) => get().ids.some((i) => i.kind === kind && i.id === id),
    }),
    { name: 'lmgl:saved' },
  ),
);
