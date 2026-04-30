import { Link } from 'react-router-dom'
import { Tr } from '@/components/ui/tr'

export function LandingPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-12 gap-16 px-8 py-20">
        <div className="col-span-7 flex min-h-[420px] flex-col justify-between">
          <div>
            <div className="label-small mb-4">
              <Tr en="Overview" zh="概覽" />
            </div>
            <h1 className="title-huge">
              <Tr
                en={
                  <>
                    Membership
                    <br />
                    Management
                  </>
                }
                zh={
                  <>
                    會員
                    <br />
                    管理系統
                  </>
                }
              />
            </h1>
          </div>

          <p className="text-foreground/65 max-w-md text-[15px] leading-relaxed">
            <Tr
              en="Register for CPWP or CPWPA certification, manage your member profile, and track applications. The unified portal for the Private Wealth Management Association of Hong Kong."
              zh="註冊 CPWP 或 CPWPA 認證、管理會員資料、追蹤申請進度。香港私人財富管理公會嘅綜合平台。"
            />
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/sign-up" className="nexus-pill-primary">
              <i className="ph ph-plus-circle text-base" aria-hidden="true" />
              <Tr en="Get started" zh="開始" />
            </Link>
            <Link to="/sign-in" className="nexus-pill-outline">
              <i className="ph ph-sign-in text-base" aria-hidden="true" />
              <Tr en="Sign in" zh="登入" />
            </Link>
            <Link to="/apply-firm" className="nexus-pill-outline">
              <i className="ph ph-buildings text-base" aria-hidden="true" />
              <Tr en="Apply as a firm" zh="公司申請" />
            </Link>
          </div>
        </div>

        <div className="col-span-5 flex flex-col justify-end gap-8">
          <div className="label-small">
            <Tr en="Membership tiers" zh="會籍級別" />
          </div>
          <div className="flex h-[90px] w-full">
            <div className="prop-solid h-full w-[45%]" />
            <div className="prop-vertical h-full w-[35%]" />
            <div className="prop-fine-vertical h-full flex-grow" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="mb-1 text-3xl font-light">CPWP</span>
              <span className="label-small flex items-center gap-2">
                <span className="bg-foreground h-2 w-2 rounded-full" />
                <Tr en="Full member" zh="正式會員" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-3xl font-light">CPWPA</span>
              <span className="label-small flex items-center gap-2">
                <span className="prop-vertical border-foreground/25 h-2 w-2 border" />
                <Tr en="Associate" zh="附屬會員" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-foreground/65 mb-1 text-3xl font-light">Guest</span>
              <span className="label-small flex items-center gap-2">
                <span className="prop-fine-vertical border-foreground/25 h-2 w-2 border" />
                <Tr en="Events only" zh="只限活動" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
