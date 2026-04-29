export function AboutPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto max-w-[900px] px-8 py-20">
        <div className="label-small mb-4">About</div>
        <h1 className="title-huge mb-12">
          About the
          <br />
          Association
        </h1>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-7 space-y-6">
            <p className="text-foreground/80 text-base leading-relaxed">
              The Private Wealth Management Association (PWMA) is the industry body for
              private wealth management in Hong Kong.
            </p>
            <p className="text-foreground/65 text-base leading-relaxed">
              This portal manages membership registration, CPWP and CPWPA applications,
              renewals, OPT tracking, events, and payments.
            </p>
          </div>

          <div className="col-span-5 flex flex-col gap-6">
            <div className="border-foreground/15 rounded-2xl border p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="status-square status-solid" />
                <span className="label-small">Members</span>
              </div>
              <p className="text-foreground/65 text-sm">
                CPWP and CPWPA-certified professionals
              </p>
            </div>
            <div className="border-foreground/15 rounded-2xl border p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="status-square status-hatched" />
                <span className="label-small">Member firms</span>
              </div>
              <p className="text-foreground/65 text-sm">
                Banks and wealth managers in Hong Kong
              </p>
            </div>
            <div className="border-foreground/15 rounded-2xl border p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="status-square status-outline" />
                <span className="label-small">Guests</span>
              </div>
              <p className="text-foreground/65 text-sm">
                Event attendees and prospective members
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
