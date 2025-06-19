import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ObjaxProject, ObjaxPage, ObjaxClass, ObjaxInstance, ObjaxState } from '../types'

interface ObjaxStore extends ObjaxProject {
  currentPage: string | null
  
  // Page actions
  addPage: (page: ObjaxPage) => void
  removePage: (name: string) => void
  setCurrentPage: (name: string | null) => void
  
  // Class actions
  addClass: (objaxClass: ObjaxClass) => void
  removeClass: (name: string) => void
  updateClass: (name: string, updates: Partial<ObjaxClass>) => void
  
  // Instance actions
  addInstance: (instance: ObjaxInstance) => void
  removeInstance: (name: string) => void
  updateInstance: (name: string, updates: Partial<ObjaxInstance>) => void
  
  // State actions
  addState: (state: ObjaxState) => void
  removeState: (name: string) => void
  updateStateValue: (name: string, value: any) => void
  getStateValue: (name: string) => any
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
        
        // Page actions
        addPage: (page) =>
          set((state) => ({
            pages: [...state.pages, page]
          })),
          
        removePage: (name) =>
          set((state) => ({
            pages: state.pages.filter((p) => p.name !== name),
            instances: state.instances.filter((i) => i.page !== name),
            currentPage: state.currentPage === name ? null : state.currentPage
          })),
          
        setCurrentPage: (name) =>
          set({ currentPage: name }),
          
        // Class actions
        addClass: (objaxClass) =>
          set((state) => ({
            classes: [...state.classes.filter((c) => c.name !== objaxClass.name), objaxClass]
          })),
          
        removeClass: (name) =>
          set((state) => ({
            classes: state.classes.filter((c) => c.name !== name)
          })),
          
        updateClass: (name, updates) =>
          set((state) => ({
            classes: state.classes.map((c) =>
              c.name === name ? { ...c, ...updates } : c
            )
          })),
          
        // Instance actions
        addInstance: (instance) =>
          set((state) => ({
            instances: [...state.instances, instance]
          })),
          
        removeInstance: (name) =>
          set((state) => ({
            instances: state.instances.filter((i) => i.name !== name)
          })),
          
        updateInstance: (name, updates) =>
          set((state) => ({
            instances: state.instances.map((i) =>
              i.name === name ? { ...i, ...updates } : i
            )
          })),
          
        // State actions
        addState: (state) =>
          set((prevState) => ({
            states: [...prevState.states.filter((s) => s.name !== state.name), state]
          })),
          
        removeState: (name) =>
          set((state) => ({
            states: state.states.filter((s) => s.name !== name)
          })),
          
        updateStateValue: (name, value) =>
          set((state) => ({
            states: state.states.map((s) =>
              s.name === name
                ? {
                    ...s,
                    history: [
                      { date: new Date().toISOString(), [name]: value },
                      ...s.history
                    ]
                  }
                : s
            )
          })),
          
        getStateValue: (name) => {
          const state = get().states.find((s) => s.name === name)
          return state?.history[0]?.[name]
        }
      }),
      {
        name: 'objax-store'
      }
    )
  )
)