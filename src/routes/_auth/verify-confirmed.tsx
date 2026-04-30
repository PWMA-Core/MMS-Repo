import { Link } from 'react-router-dom'
import { Tr } from '@/components/ui/tr'

/**
 * Lands here when a freshly-signed-up user clicks the verification link
 * in their email. In production, Supabase auth-callback resolves to this
 * page after the token is exchanged. In the mock demo, /verify links
 * here directly to simulate clicking the email.
 */
export function VerifyConfirmedPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Confirmed" zh="已確認" />
        </div>
        <h1 className="title-large">
          <Tr en="Email verified" zh="電郵已核實" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          <Tr
            en="Thanks for confirming. Your registration is now in PWMA's review queue. You'll receive an email when an admin approves your account."
            zh="多謝你確認。你嘅註冊已交去 PWMA 嘅審批佇列。獲管理員批核後，我哋會發電郵通知你。"
          />
        </p>
      </div>

      <div className="border-foreground bg-foreground/[0.02] mb-6 rounded-2xl border p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="status-square status-solid h-3 w-3" />
          <span className="label-small">
            <Tr en="Awaiting admin review" zh="等待管理員審批" />
          </span>
        </div>
        <p className="text-sm font-medium tracking-tight">
          <Tr
            en="Account created · Email confirmed · Pending PWMA approval"
            zh="帳戶已建立 · 電郵已確認 · 待 PWMA 批核"
          />
        </p>
        <p className="text-foreground/65 mt-1 text-xs leading-relaxed">
          <Tr
            en="Reviews typically complete within 4 to 6 weeks. You can sign in once approved."
            zh="一般 4 至 6 週內完成審批。獲批後即可登入。"
          />
        </p>
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
