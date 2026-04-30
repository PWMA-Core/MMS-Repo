import { cn } from '@/lib/utils/cn'
import { useI18nStore } from '@/lib/i18n/store'

interface Props {
  className?: string
  size?: 'sm' | 'md'
}

export function LanguageSwitcher({ className, size = 'md' }: Props) {
  const lang = useI18nStore((s) => s.lang)
  const setLang = useI18nStore((s) => s.setLang)

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'

  return (
    <div
      className={cn(
        'border-foreground/15 bg-background inline-flex items-center gap-0.5 rounded-full border p-0.5',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          'rounded-full font-medium tracking-wide transition-colors',
          padding,
          lang === 'en'
            ? 'bg-foreground text-background'
            : 'text-foreground/65 hover:text-foreground',
        )}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('zh')}
        className={cn(
          'rounded-full font-medium tracking-wide transition-colors',
          padding,
          lang === 'zh'
            ? 'bg-foreground text-background'
            : 'text-foreground/65 hover:text-foreground',
        )}
        aria-pressed={lang === 'zh'}
      >
        繁中
      </button>
    </div>
  )
}
