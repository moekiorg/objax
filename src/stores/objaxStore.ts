import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  ObjaxClass,
  ObjaxInstance,
  ObjaxPage,
  ObjaxProject,
  ObjaxState,
  HistoryState,
} from '../types';

interface ObjaxStore extends ObjaxProject {
  currentPage: string | null;
  showPlayground: boolean;
  history: HistoryState[];
  historyIndex: number;

  // Page actions
  addPage: (page: ObjaxPage) => void;
  removePage: (name: string) => void;
  setCurrentPage: (name: string | null) => void;
  setCurrentPageWithHistory: (name: string | null, pushToHistory?: boolean) => void;
  togglePlayground: () => void;

  // Class actions
  addClass: (objaxClass: ObjaxClass) => void;
  removeClass: (name: string) => void;
  updateClass: (name: string, updates: Partial<ObjaxClass>) => void;

  // Instance actions
  addInstance: (instance: ObjaxInstance) => void;
  removeInstance: (id: string) => void;
  updateInstance: (id: string, updates: Partial<ObjaxInstance>) => void;

  // State actions
  addState: (state: ObjaxState) => void;
  removeState: (name: string) => void;
  updateStateValue: (name: string, value: any) => void;
  getStateValue: (name: string) => any;

  // History actions
  saveToHistory: () => void;
  undo: () => void;
  canUndo: () => boolean;
}

export const useObjaxStore = create<ObjaxStore>()(
  devtools(
    persist(
      (set, get) => ({
        pages: [],
        states: [],
        instances: [],
        classes: [],
        currentPage: null,
        showPlayground: false,
        history: [],
        historyIndex: -1,

        // Page actions
        addPage: (page) =>
          set((state) => ({
            pages: [...state.pages, page],
          })),

        removePage: (name) =>
          set((state) => ({
            pages: state.pages.filter((p) => p.name !== name),
            instances: state.instances.filter((i) => i.page !== name),
            currentPage: state.currentPage === name ? null : state.currentPage,
          })),

        setCurrentPage: (name) => set({ currentPage: name }),

        setCurrentPageWithHistory: (name, pushToHistory = true) => {
          // Update browser history if requested
          if (pushToHistory && typeof window !== 'undefined') {
            if (name) {
              const url = `${window.location.origin}${window.location.pathname}?page=${encodeURIComponent(name)}`;
              window.history.pushState({ page: name }, '', url);
            } else {
              const url = `${window.location.origin}${window.location.pathname}`;
              window.history.pushState({ page: null }, '', url);
            }
          }
          
          set({ currentPage: name });
        },

        togglePlayground: () => set((state) => ({ 
          showPlayground: !state.showPlayground,
          currentPage: state.showPlayground ? state.currentPage : null 
        })),

        // Class actions
        addClass: (objaxClass) =>
          set((state) => ({
            classes: [
              ...state.classes.filter((c) => c.name !== objaxClass.name),
              objaxClass,
            ],
          })),

        removeClass: (name) =>
          set((state) => ({
            classes: state.classes.filter((c) => c.name !== name),
          })),

        updateClass: (name, updates) =>
          set((state) => ({
            classes: state.classes.map((c) =>
              c.name === name ? { ...c, ...updates } : c,
            ),
          })),

        // Instance actions
        addInstance: (instance) =>
          set((state) => {
            // Save current state to history before adding
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({
              instances: state.instances,
              timestamp: Date.now(),
            });
            
            return {
              instances: [...state.instances, instance],
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        removeInstance: (id) =>
          set((state) => {
            // Save current state to history before removing
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({
              instances: state.instances,
              timestamp: Date.now(),
            });
            
            return {
              instances: state.instances.filter((i) => i.id !== id),
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        updateInstance: (id, updates) =>
          set((state) => {
            // Save current state to history before updating
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({
              instances: state.instances,
              timestamp: Date.now(),
            });
            
            return {
              instances: state.instances.map((i) =>
                i.id === id ? { ...i, ...updates } : i,
              ),
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }),

        // State actions
        addState: (state) =>
          set((prevState) => ({
            states: [
              ...prevState.states.filter((s) => s.name !== state.name),
              state,
            ],
          })),

        removeState: (name) =>
          set((state) => ({
            states: state.states.filter((s) => s.name !== name),
          })),

        updateStateValue: (name, value) =>
          set((state) => ({
            states: state.states.map((s) =>
              s.name === name
                ? {
                    ...s,
                    history: [
                      { date: new Date().toISOString(), [name]: value },
                      ...s.history,
                    ],
                  }
                : s,
            ),
          })),

        getStateValue: (name) => {
          const state = get().states.find((s) => s.name === name);
          return state?.history[0]?.[name];
        },

        // History actions
        saveToHistory: () => {
          set((state) => {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({
              instances: state.instances,
              timestamp: Date.now(),
            });
            
            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          });
        },

        undo: () => {
          set((state) => {
            if (state.historyIndex < 0) return state;
            
            const previousState = state.history[state.historyIndex];
            return {
              instances: previousState.instances,
              historyIndex: state.historyIndex - 1,
            };
          });
        },

        canUndo: () => {
          const state = get();
          return state.historyIndex >= 0;
        },
      }),
      {
        name: 'objax-store',
        partialize: (state) => ({
          pages: state.pages,
          states: state.states,
          instances: state.instances,
          classes: state.classes,
          currentPage: state.currentPage,
          showPlayground: state.showPlayground,
          // Exclude history and historyIndex from persistence
        }),
      },
    ),
  ),
);
