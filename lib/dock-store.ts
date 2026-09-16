import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

interface DockState {
  quickLinks: QuickLink[];
  addQuickLink: (link: Omit<QuickLink, 'id'>) => void;
  removeQuickLink: (id: string) => void;
  editQuickLink: (id: string, updates: Partial<QuickLink>) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useDockStore = create<DockState>()(
  persist(
    (set) => ({
      quickLinks: [],
      addQuickLink: (link) => set((state) => ({
        quickLinks: [...state.quickLinks, { ...link, id: Date.now().toString() }]
      })),
      removeQuickLink: (id) => set((state) => ({
        quickLinks: state.quickLinks.filter(l => l.id !== id)
      })),
      editQuickLink: (id, updates) => set((state) => ({
        quickLinks: state.quickLinks.map(l => l.id === id ? { ...l, ...updates } : l)
      })),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'base:dock-config',
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state.setHasHydrated(true);
        } else {
          useDockStore.setState({ _hasHydrated: true });
        }
      },
    }
  )
);
