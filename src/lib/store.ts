import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userBalance: number;
  setUserBalance: (amount: number) => void;
}

export const useStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  userBalance: 45285.00,
  setUserBalance: (amount) => set({ userBalance: amount }),
}));
