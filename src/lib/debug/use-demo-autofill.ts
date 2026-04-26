import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { UseFormReturn, FieldValues } from 'react-hook-form'

/**
 * When `?demo=1` is in the URL, calls `form.reset(values)` once on mount
 * so the form renders pre-filled. Strips the param after filling so a
 * page reload does not re-clobber user edits.
 *
 * Used by every form that wants DevNav autofill. Safe to leave in the
 * codebase in production: if nobody appends `?demo=1`, nothing happens.
 */
export function useDemoAutofill<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  values: TValues,
): void {
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    if (params.get('demo') !== '1') return
    form.reset(values)
    const next = new URLSearchParams(params)
    next.delete('demo')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
