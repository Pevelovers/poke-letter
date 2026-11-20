import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { configQuery } from '@/api/queries'
import { ActionButton } from '@/components/common/ActionButton'
import { RevealBadge } from '@/components/common/RevealBadge'
import { PageLayout } from '@/components/layout/PageLayout'
import { TreeScene } from '@/components/tree/TreeScene'
import { strings } from '@/config/strings'
import { useNow } from '@/hooks/useNow'

/** 기본 공개 시각. 설정을 받기 전에도 화면을 그리기 위해 쓴다 */
const DEFAULT_REVEAL_AT = '2026-12-25T00:00:00+09:00'

/** `/` 서비스 소개, 공개일, 시작 버튼 (US-01 1단계) */
export function LandingPage() {
  const now = useNow()
  const { data: config } = useQuery(configQuery)
  const revealAt = config?.revealAt ?? DEFAULT_REVEAL_AT
  const revealed = now.getTime() >= Date.parse(revealAt)

  return (
    <PageLayout className="gap-6">
      <section className="flex flex-col items-center gap-3 pt-4 text-center">
        <RevealBadge revealAt={revealAt} revealed={revealed} now={now} />
        <h1 className="text-2xl leading-snug font-bold whitespace-pre-line">
          {strings.landing.headline}
        </h1>
        <p className="text-muted-foreground">{strings.landing.description}</p>
      </section>

      <TreeScene decorations={[]} now={now} />

      <section className="flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">{strings.landing.reveal}</p>
        <ActionButton asChild>
          <Link to="/login">{strings.landing.start}</Link>
        </ActionButton>
      </section>
    </PageLayout>
  )
}
