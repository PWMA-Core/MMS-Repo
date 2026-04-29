import * as React from 'react'

import { cn } from '@/lib/utils/cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Nexus default: taller, rounded-xl, lighter border, no shadow
        'border-foreground/15 h-12 w-full min-w-0 rounded-xl border bg-transparent px-4 py-2 text-base transition-colors outline-none',
        'selection:bg-foreground selection:text-background',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-foreground/40',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-foreground focus-visible:ring-foreground/20 focus-visible:ring-1',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
