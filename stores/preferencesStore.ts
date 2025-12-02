import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface PreferencesStore {
  mostrarValores: boolean
  toggleMostrarValores: () => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      mostrarValores: true, // Por padrão, mostra os valores
      toggleMostrarValores: () =>
        set((state) => ({ mostrarValores: !state.mostrarValores })),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)




