import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  to: string
  label: string
}

export function SideNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex flex-col gap-1 border-r bg-muted/20 p-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
