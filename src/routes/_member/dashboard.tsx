import { Link } from 'react-router-dom'
import { useCurrentProfile } from '@/hooks/use-user'
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_LABELS_ZH,
} from '@/lib/constants/account-statuses'
import { Tr, useTr } from '@/components/ui/tr'

export function MemberDashboardPage() {
  const { data: profile, isLoading } = useCurrentProfile()
  const t = useTr()

  const statusVariant: 'solid' | 'hatched' | 'outline' =
    profile?.account_status === 'active'
      ? 'solid'
      : profile?.account_status === 'pending_pwma_approval'
        ? 'hatched'
        : 'outline'

  return (
    <>
      {/* Header */}
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">
            <Tr en="Welcome" zh="歡迎" />
          </div>
          <h1 className="title-huge">
            {profile?.legal_name?.split(' ')[0] ?? t('Member', '會員')}
            <br />
            <Tr en="Portal" zh="平台" />
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <Link to="/profile" className="nexus-pill-outline">
            <i className="ph ph-user" aria-hidden="true" />
            <Tr en="Profile" zh="個人資料" />
          </Link>
          <Link to="/renewal" className="nexus-pill-primary">
            <i className="ph ph-arrows-clockwise text-lg" aria-hidden="true" />
            <Tr en="Renew membership" zh="續期會籍" />
          </Link>
        </div>
      </header>

      {/* Status block */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex flex-col">
          <div className="mb-12 flex gap-16">
            <div className="flex flex-col">
              <span className="label-small mb-2">
                <Tr en="Account status" zh="帳戶狀態" />
              </span>
              <span className="text-5xl font-light tracking-tight">
                {isLoading ? (
                  '—'
                ) : profile?.account_status ? (
                  <Tr
                    en={ACCOUNT_STATUS_LABELS[profile.account_status]}
                    zh={ACCOUNT_STATUS_LABELS_ZH[profile.account_status]}
                  />
                ) : (
                  t('Unknown', '未知')
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="label-small mb-2">
                <Tr en="Member since" zh="加入年份" />
              </span>
              <span className="text-foreground/65 text-5xl font-light tracking-tight">
                {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}
              </span>
            </div>
          </div>
          <p className="text-foreground/65 max-w-md text-sm leading-relaxed">
            {profile?.account_status === 'pending_pwma_approval'
              ? t(
                  'Your account is awaiting PWMA admin approval. You will receive an email once reviewed.',
                  '你的帳戶正等待 PWMA 審批，審批完成後將以電郵通知你。',
                )
              : profile?.account_status === 'active'
                ? t(
                    'Your account is active. Use the menu to update your profile or file your annual renewal.',
                    '你的帳戶已啟用。可使用選單更新個人資料或提交年度續期。',
                  )
                : t(
                    'Welcome to the PWMA Membership system.',
                    '歡迎使用 PWMA 會員管理系統。',
                  )}
          </p>
        </section>

        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">
            <Tr en="Membership health" zh="會籍狀況" />
          </div>
          <div className="mb-8 flex h-[90px] w-full">
            <div
              className={`h-full ${statusVariant === 'solid' ? 'prop-solid' : statusVariant === 'hatched' ? 'prop-vertical' : 'prop-fine-vertical'} w-full`}
            />
          </div>
          <div className="flex w-full justify-between">
            <div className="flex flex-col">
              <span className="label-small flex items-center gap-2">
                <span className={`status-square status-${statusVariant}`} />
                <Tr en="Status" zh="狀態" />
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">
            <Tr en="Action" zh="操作" />
          </span>
          <span className="label-small">
            <Tr en="Type" zh="類型" />
          </span>
          <span className="label-small">
            <Tr en="Description" zh="說明" />
          </span>
          <span className="label-small">
            <Tr en="Status" zh="狀態" />
          </span>
          <span className="label-small text-right">
            <Tr en="Open" zh="開啟" />
          </span>
        </div>

        <ActionRow
          name={t('My profile', '我的資料')}
          type="Profile"
          description={t(
            'Edit non-critical fields, request changes for critical ones',
            '編輯一般資料，或申請修改受保護欄位',
          )}
          to="/profile"
          variant="solid"
          openLabel={t('Open', '開啟')}
        />
        <ActionRow
          name={t('Annual renewal', '年度續期')}
          type="WF3"
          description={t(
            'Profile-confirm gate and renewal application',
            '確認個人資料後提交續期申請',
          )}
          to="/renewal"
          variant="hatched"
          last
          openLabel={t('Open', '開啟')}
        />
      </section>
    </>
  )
}

function ActionRow({
  name,
  type,
  description,
  to,
  variant,
  last = false,
  openLabel,
}: {
  name: string
  type: string
  description: string
  to: string
  variant: 'solid' | 'hatched' | 'outline'
  last?: boolean
  openLabel: string
}) {
  return (
    <Link
      to={to}
      className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} group hover:bg-foreground/[0.03] relative -mx-4 cursor-pointer px-4 transition-colors`}
    >
      <div className="flex flex-col gap-1 pl-4">
        <span className="text-[1.1rem] font-medium tracking-tight">{name}</span>
      </div>
      <div>
        <span className="value-medium">{type}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[0.95rem]">{description}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`status-square status-${variant}`} />
        <span className="text-foreground/80 text-[0.9rem] tracking-wide">
          {openLabel}
        </span>
      </div>
      <div className="text-right">
        <span className="border-foreground/25 group-hover:border-foreground inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
          <i className="ph ph-arrow-right" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
