import { create } from 'zustand';

interface LoadingBarState {
  isLoading: boolean;
  start: () => void;
  done: () => void;
}

export const useLoadingBar = create<LoadingBarState>((set) => ({
  isLoading: false,
  start: () => set({ isLoading: true }),
  done: () => set({ isLoading: false }),
}));
