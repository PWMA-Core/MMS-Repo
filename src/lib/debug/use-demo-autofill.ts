import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { UseFormReturn, FieldValues } from 'react-hook-form'

/**
 * Refills the form whenever `?demo=1` appears in the URL — including
 * the case where the user is already on the page and the DevNav
 * "Fill" button just appended `?demo=1` to the same path. After
 * filling, the param is stripped so a page reload doesn't clobber
 * subsequent edits.
 *
 * Used by every form that wants DevNav autofill. Safe to leave in the
 * codebase in production: if nobody appends `?demo=1`, nothing happens.
 */
export function useDemoAutofill<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  values: TValues,
): void {
  const [params, setParams] = useSearchParams()
  const demoFlag = params.get('demo')

  useEffect(() => {
    if (demoFlag !== '1') return
    form.reset(values)
    const next = new URLSearchParams(params)
    next.delete('demo')
    setParams(next, { replace: true })
    // `values` is a module-level constant from dummy-data.ts so re-running
    // on its identity won't loop. Re-fire only when demoFlag toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoFlag])
}
