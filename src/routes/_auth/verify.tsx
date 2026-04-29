import { Link } from 'react-router-dom'
import { Tr } from '@/components/ui/tr'

export function VerifyPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Almost there" zh="即將完成" />
        </div>
        <h1 className="title-large">
          <Tr en="Check your email" zh="請查閱電郵" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          <Tr
            en="We sent a verification link to your inbox. Click it to confirm your account, then wait for PWMA to approve your registration."
            zh="我們已發送驗證連結至你嘅電郵信箱。點擊連結確認帳戶後，請等待 PWMA 審批你嘅申請。"
          />
        </p>
      </div>

      <div className="border-foreground/15 mb-6 rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <span className="status-square status-hatched mt-1.5" />
          <div className="flex-1">
            <p className="mb-1 text-sm font-medium">
              <Tr en="No email yet?" zh="未收到電郵？" />
            </p>
            <p className="text-foreground/65 text-xs leading-relaxed">
              <Tr
                en="Check your spam folder. If still nothing after a minute, try signing in again to trigger a resend prompt."
                zh="請先查閱垃圾郵件資料夾。如一分鐘後仍未收到，可嘗試重新登入以觸發重新發送。"
              />
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm">
        <Link
          to="/sign-in"
          className="text-foreground/65 hover:text-foreground underline underline-offset-4"
        >
          <Tr en="Back to sign-in" zh="返回登入" />
        </Link>
      </p>
    </div>
  )
}
