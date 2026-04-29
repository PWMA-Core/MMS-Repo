import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  // Nexus default: pill-shaped, no shadow, tight tracking
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap tracking-wide transition-colors outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background hover:opacity-90 font-semibold',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline:
          'border border-foreground/25 bg-transparent hover:border-foreground hover:bg-foreground/[0.04]',
        secondary: 'bg-foreground/5 text-foreground hover:bg-foreground/10',
        ghost: 'text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]',
        link: 'text-foreground underline-offset-4 hover:underline rounded-none',
      },
      size: {
        default: 'h-11 px-6 text-sm has-[>svg]:px-5',
        xs: "h-7 gap-1 px-3 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-9 gap-1.5 px-4 text-xs has-[>svg]:px-3.5',
        lg: 'h-12 px-8 text-sm has-[>svg]:px-7',
        icon: 'size-11',
        'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
