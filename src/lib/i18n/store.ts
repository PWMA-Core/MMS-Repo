import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'en' | 'zh'

interface I18nState {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((s) => ({ lang: s.lang === 'en' ? 'zh' : 'en' })),
    }),
    { name: 'pwma_lang' },
  ),
)
