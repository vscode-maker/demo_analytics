import { create } from 'zustand';
import { ImportRecord, FilterParams } from '../types';

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Active import (single select - for backward compatibility)
  activeImport: ImportRecord | null;
  setActiveImport: (importRecord: ImportRecord | null) => void;
  
  // Selected imports (multi-select for merging)
  selectedImports: ImportRecord[];
  setSelectedImports: (imports: ImportRecord[]) => void;
  toggleImportSelection: (importRecord: ImportRecord) => void;
  clearSelection: () => void;
  
  // Filters
  filters: FilterParams;
  setFilters: (filters: FilterParams) => void;
  
  // Sidebar collapsed
  leftSidebarCollapsed: boolean;
  rightChatCollapsed: boolean;
  toggleLeftSidebar: () => void;
  toggleRightChat: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Theme
  theme: (localStorage.getItem('vla_theme') as 'light' | 'dark') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('vla_theme', theme);
    set({ theme });
  },
  
  // Active import (single)
  activeImport: null,
  setActiveImport: (activeImport) => set({ activeImport }),
  
  // Selected imports (multi)
  selectedImports: [],
  setSelectedImports: (selectedImports) => set({ selectedImports }),
  toggleImportSelection: (importRecord) => set((state) => {
    const isSelected = state.selectedImports.some(imp => imp.id === importRecord.id);
    if (isSelected) {
      return { 
        selectedImports: state.selectedImports.filter(imp => imp.id !== importRecord.id),
        // Clear activeImport if it was the toggled one
        activeImport: state.activeImport?.id === importRecord.id ? null : state.activeImport
      };
    } else {
      const newSelected = [...state.selectedImports, importRecord];
      return { 
        selectedImports: newSelected,
        // Set activeImport to first selected if none
        activeImport: state.activeImport || importRecord
      };
    }
  }),
  clearSelection: () => set({ selectedImports: [], activeImport: null }),
  
  // Filters
  filters: {},
  setFilters: (filters) => set({ filters }),
  
  // Sidebar
  leftSidebarCollapsed: false,
  rightChatCollapsed: false,
  toggleLeftSidebar: () => set((state) => ({ leftSidebarCollapsed: !state.leftSidebarCollapsed })),
  toggleRightChat: () => set((state) => ({ rightChatCollapsed: !state.rightChatCollapsed })),
}));
