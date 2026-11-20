import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { ballsQuery, meQuery } from '@/api/queries'
import { ActionButton } from '@/components/common/ActionButton'
import { PixelImage } from '@/components/common/PixelImage'
import { PageLayout } from '@/components/layout/PageLayout'
import { spriteSize } from '@/config/assets'
import { strings } from '@/config/strings'

interface SentPageProps {
  treeId: string
  /** 직접 고른 포켓몬 이름. 랜덤이면 없음 */
  pokemon?: string
  shiny?: boolean
  ballId?: number
}

/** 전송 완료 (F-MSG-05, F-MSG-10). 다음 트리 주인을 만드는 입구다 (US-03a) */
export function SentPage({ treeId, pokemon, shiny = false, ballId }: SentPageProps) {
  const { data: balls } = useQuery(ballsQuery)
  // 작성자는 보통 로그인하지 않았으므로 실패(401)해도 조용히 넘어간다
  const { data: me } = useQuery(meQuery)
  const ball = balls?.balls.find((item) => item.ballId === ballId)

  return (
    <PageLayout className="items-center justify-center gap-4 text-center">
      {ball && (
        <PixelImage
          src={ball.imageUrl}
          alt={ball.name}
          width={spriteSize.ball.width}
          height={spriteSize.ball.height}
          scale={4}
          className="animate-bounce"
        />
      )}
      <h1 className="text-xl">{pokemon ? strings.sent.chosen(pokemon) : strings.sent.done}</h1>
      {shiny && <p className="font-game text-base text-accent-foreground">{strings.sent.shiny}</p>}
      <p className="text-muted-foreground">{strings.sent.description}</p>

      <div className="mt-6 flex w-full flex-col gap-2">
        <ActionButton asChild>
          <Link to="/t/$treeId" params={{ treeId }}>
            {strings.sent.backToTree}
          </Link>
        </ActionButton>
        <ActionButton asChild variant="outline">
          {me?.tree ? (
            <Link to="/me">{strings.sent.viewMine}</Link>
          ) : (
            <Link to={me ? '/me' : '/login'}>{strings.sent.createMine}</Link>
          )}
        </ActionButton>
      </div>
    </PageLayout>
  )
}
