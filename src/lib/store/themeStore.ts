// src/lib/store/themeStore.ts
import { create } from 'zustand';
import type { ThemeSettings } from '@/lib/types';

// This is the shape of our shared state
type ThemeState = {
  theme: any | null; // Use 'any' for flexibility for now
  setInitialTheme: (settings: ThemeSettings) => void;
  updateTheme: (newValues: Partial<any>) => void;
};

// Create the store
export const useThemeStore = create<ThemeState>((set) => ({
  theme: null,
  // Action to set the initial theme when the page loads
  setInitialTheme: (settings) => set({ 
    theme: {
        ...(settings.draft_settings || {}),
        logoUrl: settings.draft_logo_url,
        headerBgColor: settings.draft_header_bg_color,
        footerBgColor: settings.draft_footer_bg_color,
        background: settings.draft_background,
    }
  }),
  // Action to merge in new changes from the customizer
  updateTheme: (newValues) => set((state) => ({
    theme: { ...state.theme, ...newValues },
  })),
}));