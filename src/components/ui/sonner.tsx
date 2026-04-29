import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Nexus-styled toast: muted navy + white surface (no rich green/red),
 * Phosphor icons, fully-rounded corners to match the rest of the
 * design system. The status colour is conveyed by a thin left border
 * and a small icon tile, not by flooding the toast background.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <i className="ph-fill ph-check-circle text-base" aria-hidden="true" />,
        info: <i className="ph-fill ph-info text-base" aria-hidden="true" />,
        warning: <i className="ph-fill ph-warning text-base" aria-hidden="true" />,
        error: <i className="ph-fill ph-x-circle text-base" aria-hidden="true" />,
        loading: (
          <i className="ph ph-circle-notch animate-spin text-base" aria-hidden="true" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast !bg-background !text-foreground !border !border-foreground/15 !rounded-2xl !shadow-[0_8px_32px_rgba(22,32,64,0.08)] !p-4 !gap-3 !font-normal',
          title: '!text-foreground !text-sm !font-medium !tracking-tight',
          description: '!text-foreground/65 !text-xs !leading-relaxed',
          icon: '!self-center',
          success: '!border-l-4 !border-l-foreground',
          info: '!border-l-4 !border-l-foreground/50',
          warning: '!border-l-4 !border-l-foreground',
          error: '!border-l-4 !border-l-destructive',
          actionButton:
            '!bg-foreground !text-background !rounded-full !px-3 !py-1 !text-xs !font-medium',
          cancelButton:
            '!bg-transparent !text-foreground/65 !rounded-full !px-3 !py-1 !text-xs',
          closeButton:
            '!bg-background !border-foreground/15 !text-foreground/65 hover:!text-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
