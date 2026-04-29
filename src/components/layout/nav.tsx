import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { useI18nStore } from '@/lib/i18n/store'

export interface NavItem {
  to: string
  label: string
  zh?: string // Traditional Chinese label, used when language is 繁中
  icon?: string // Phosphor icon name, e.g. "squares-four"
}

export function SideNav({ items }: { items: NavItem[] }) {
  const lang = useI18nStore((s) => s.lang)
  return (
    <nav className="flex flex-1 flex-col gap-6">
      <div className="label-small mb-2 opacity-50">{lang === 'zh' ? '選單' : 'Menu'}</div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-4 transition-colors',
              isActive ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="bg-foreground absolute -left-8 h-full w-[2px]" />
              )}
              {item.icon && (
                <i
                  className={`ph ph-${item.icon} shrink-0 text-[22px]`}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'text-[0.95rem] tracking-wide',
                  isActive ? 'font-medium' : '',
                )}
              >
                {lang === 'zh' && item.zh ? item.zh : item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
