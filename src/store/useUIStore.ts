import { create } from "zustand";

export type Screens =
  | "setup"
  | "matchday"
  | "calendar"
  | "dashboard"
  | "tables"
  | "settings"
  | "team"
  | "messages"
  | "market";

interface UIState {
  currentScreen: Screens;
  isExiting: boolean;
  activeModal: string | null;

  setScreen: (screen: Screens) => void;
  startTransition: (nextScreen: Screens) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: "setup",
  isExiting: false,
  activeModal: null,

  setScreen: (screen) => set({ currentScreen: screen }),

  startTransition: (nextScreen) => {
    set({ isExiting: true });
    setTimeout(() => {
      set({ currentScreen: nextScreen, isExiting: false });
    }, 1600);
  },

  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
