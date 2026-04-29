import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Nexus toast. Pure monochrome navy/white. Status is conveyed by a
 * 10px solid square on the left (matching the .status-square motif
 * used on the admin dashboard), not by a coloured side stripe.
 *
 * Layout: square · text. No icons, no chrome on the borders, no
 * coloured fills. Hairline border + soft navy shadow do the lifting.
 */
const StatusSquare = ({
  tone,
}: {
  tone: 'solid' | 'hatched' | 'outline' | 'destructive'
}) => {
  const base = 'inline-block h-2.5 w-2.5 shrink-0 mt-1.5'
  if (tone === 'destructive') {
    return <span className={`${base} bg-destructive`} aria-hidden="true" />
  }
  if (tone === 'hatched') {
    return (
      <span
        className={`${base} opacity-50`}
        style={{
          background:
            'repeating-linear-gradient(45deg, var(--foreground), var(--foreground) 1px, transparent 1px, transparent 3px)',
        }}
        aria-hidden="true"
      />
    )
  }
  if (tone === 'outline') {
    return (
      <span
        className={`${base} opacity-40`}
        style={{ border: '1px solid var(--foreground)', background: 'transparent' }}
        aria-hidden="true"
      />
    )
  }
  return <span className={`${base} bg-foreground`} aria-hidden="true" />
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <StatusSquare tone="solid" />,
        info: <StatusSquare tone="outline" />,
        warning: <StatusSquare tone="hatched" />,
        error: <StatusSquare tone="destructive" />,
        loading: <StatusSquare tone="hatched" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast !bg-background !text-foreground !border !border-foreground/12 !rounded-xl !shadow-[0_2px_24px_-8px_rgba(22,32,64,0.12)] !px-4 !py-3.5 !gap-2.5 !font-normal !items-start',
          title:
            '!text-foreground !text-[13px] !font-medium !tracking-tight !leading-snug',
          description: '!text-foreground/55 !text-[11px] !leading-relaxed !mt-0.5',
          icon: '!m-0',
          actionButton:
            '!bg-foreground !text-background !rounded-full !px-3 !py-1 !text-[11px] !font-medium !tracking-wide',
          cancelButton:
            '!bg-transparent !text-foreground/55 !rounded-full !px-3 !py-1 !text-[11px]',
          closeButton:
            '!bg-background !border-foreground/12 !text-foreground/40 hover:!text-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
