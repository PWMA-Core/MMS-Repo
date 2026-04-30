import type { ReactNode } from 'react'
import { useI18nStore } from '@/lib/i18n/store'

/**
 * Inline bilingual text. Renders English by default, Traditional Chinese
 * when the language switcher is set to 繁中.
 *
 * Usage:
 *   <Tr en="Dashboard" zh="總覽" />
 *   <Tr en={<>Hello<br/>World</>} zh={<>你好<br/>世界</>} />
 */
export function Tr({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const lang = useI18nStore((s) => s.lang)
  return <>{lang === 'zh' ? zh : en}</>
}

/**
 * Hook variant for places where you need a string (className, attr,
 * dynamic prop, toast message). Returns a function (en, zh) => string.
 */
export function useTr() {
  const lang = useI18nStore((s) => s.lang)
  return (en: string, zh: string) => (lang === 'zh' ? zh : en)
}
