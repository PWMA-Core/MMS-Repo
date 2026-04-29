import { Link } from 'react-router-dom'
import { Tr } from '@/components/ui/tr'

export function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Get started" zh="開始" />
        </div>
        <h1 className="title-large">
          <Tr en="Create account" zh="建立帳戶" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm">
          <Tr
            en="Choose the registration path that matches you."
            zh="揀啱你身份嘅註冊方式。"
          />
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to="/register/individual"
          className="group border-foreground/15 hover:border-foreground flex min-h-[88px] items-center justify-between rounded-2xl border p-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="status-square status-solid shrink-0" />
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-medium tracking-tight">
                <Tr en="Individual member" zh="個人會員" />
              </span>
              <span className="text-foreground/65 text-xs">
                <Tr en="CPWP / CPWPA certification" zh="CPWP / CPWPA 認證" />
              </span>
            </div>
          </div>
          <i
            className="ph ph-arrow-right text-foreground/65 group-hover:text-foreground shrink-0 text-lg transition-colors"
            aria-hidden="true"
          />
        </Link>

        <Link
          to="/register/guest"
          className="group border-foreground/15 hover:border-foreground flex min-h-[88px] items-center justify-between rounded-2xl border p-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="status-square status-hatched shrink-0" />
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-medium tracking-tight">
                <Tr en="Guest" zh="訪客" />
              </span>
              <span className="text-foreground/65 text-xs">
                <Tr en="Events only" zh="只可參加活動" />
              </span>
            </div>
          </div>
          <i
            className="ph ph-arrow-right text-foreground/65 group-hover:text-foreground shrink-0 text-lg transition-colors"
            aria-hidden="true"
          />
        </Link>

        <Link
          to="/apply-firm"
          className="group border-foreground/15 hover:border-foreground flex min-h-[88px] items-center justify-between rounded-2xl border p-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="status-square status-outline shrink-0" />
            <div className="flex flex-col">
              <span className="text-[1.05rem] font-medium tracking-tight">
                <Tr en="Apply as a firm" zh="公司申請" />
              </span>
              <span className="text-foreground/65 text-xs">
                <Tr en="WF1 review-gated onboarding" zh="WF1 經審批嘅入會流程" />
              </span>
            </div>
          </div>
          <i
            className="ph ph-arrow-right text-foreground/65 group-hover:text-foreground shrink-0 text-lg transition-colors"
            aria-hidden="true"
          />
        </Link>
      </div>

      <p className="text-foreground/65 pt-8 text-center text-sm">
        <Tr en="Already a member?" zh="已是會員?" />{' '}
        <Link
          to="/sign-in"
          className="text-foreground underline underline-offset-4 hover:opacity-80"
        >
          <Tr en="Sign in" zh="登入" />
        </Link>
      </p>
    </div>
  )
}
