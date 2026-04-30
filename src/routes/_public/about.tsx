import { Tr } from '@/components/ui/tr'

export function AboutPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto max-w-[900px] px-8 py-20">
        <div className="label-small mb-4">
          <Tr en="About" zh="關於" />
        </div>
        <h1 className="title-huge mb-12">
          <Tr
            en={
              <>
                About the
                <br />
                Association
              </>
            }
            zh={
              <>
                關於
                <br />
                公會
              </>
            }
          />
        </h1>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-7 space-y-6">
            <p className="text-foreground/80 text-base leading-relaxed">
              <Tr
                en="The Private Wealth Management Association (PWMA) is the industry body for private wealth management in Hong Kong."
                zh="香港私人財富管理公會 (PWMA) 係本港私人財富管理業界嘅代表機構。"
              />
            </p>
            <p className="text-foreground/65 text-base leading-relaxed">
              <Tr
                en="This portal manages membership registration, CPWP and CPWPA applications, renewals, OPT tracking, events, and payments."
                zh="此平台涵蓋會員註冊、CPWP 及 CPWPA 申請、續期、OPT 記錄、活動及繳費等功能。"
              />
            </p>
          </div>

          <div className="col-span-5 flex flex-col gap-6">
            <div className="border-foreground/15 rounded-2xl border p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="status-square status-solid" />
                <span className="label-small">
                  <Tr en="Members" zh="會員" />
                </span>
              </div>
              <p className="text-foreground/65 text-sm">
                <Tr
                  en="CPWP and CPWPA-certified professionals"
                  zh="持有 CPWP 及 CPWPA 認證嘅專業人士"
                />
              </p>
            </div>
            <div className="border-foreground/15 rounded-2xl border p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="status-square status-hatched" />
                <span className="label-small">
                  <Tr en="Member firms" zh="會員機構" />
                </span>
              </div>
              <p className="text-foreground/65 text-sm">
                <Tr
                  en="Banks and wealth managers in Hong Kong"
                  zh="香港各銀行及財富管理機構"
                />
              </p>
            </div>
            <div className="border-foreground/15 rounded-2xl border p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="status-square status-outline" />
                <span className="label-small">
                  <Tr en="Guests" zh="訪客" />
                </span>
              </div>
              <p className="text-foreground/65 text-sm">
                <Tr
                  en="Event attendees and prospective members"
                  zh="活動參加者及有意入會人士"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
