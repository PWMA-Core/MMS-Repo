import { Link } from 'react-router-dom'
import { FirmApplicationForm } from '@/components/forms/firm-application-form'
import { Tr } from '@/components/ui/tr'

export function ApplyFirmPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto max-w-[900px] px-8 py-16">
        <div className="mb-12">
          <div className="label-small mb-3">
            <Tr en="WF1 application" zh="WF1 申請" />
          </div>
          <h1 className="title-large mb-4">
            <Tr en="Apply as a member firm" zh="申請成為會員機構" />
          </h1>
          <p className="text-foreground/65 max-w-xl text-sm leading-relaxed">
            <Tr
              en="For firms that wish to join PWMA. Review by the Executive Committee takes 4 to 6 weeks. Employees only need individual accounts once the firm is approved."
              zh="供有意加入 PWMA 嘅機構申請。執行委員會審批需時 4 至 6 週。機構獲批後，員工只需自行開設個人帳戶。"
            />
          </p>
        </div>

        <FirmApplicationForm />
      </div>
    </section>
  )
}

export function ApplyFirmThanksPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto max-w-xl px-8 py-32 text-center">
        <div className="mb-8 flex justify-center">
          <span className="status-square status-solid h-6 w-6" />
        </div>
        <div className="label-small mb-3">
          <Tr en="Submitted" zh="已提交" />
        </div>
        <h1 className="title-large mb-4">
          <Tr en="Application received" zh="申請已收到" />
        </h1>
        <p className="text-foreground/65 text-sm leading-relaxed">
          <Tr
            en="We have emailed a confirmation to your contact address. Our team will begin review and respond within 4 to 6 weeks."
            zh="我哋已將確認電郵寄到你嘅聯絡地址。團隊會喺 4 至 6 週內完成審批同回覆。"
          />
        </p>
        <div className="pt-10">
          <Link to="/" className="nexus-pill-outline">
            <i className="ph ph-house" aria-hidden="true" />
            <Tr en="Back to home" zh="返回首頁" />
          </Link>
        </div>
      </div>
    </section>
  )
}
