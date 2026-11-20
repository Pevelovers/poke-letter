import { useQuery } from '@tanstack/react-query'

import { ballsQuery } from '@/api/queries'
import type { BallView } from '@/api/types'
import { PixelImage } from '@/components/common/PixelImage'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageLayout } from '@/components/layout/PageLayout'
import { spriteSize } from '@/config/assets'
import { strings } from '@/config/strings'
import { cn } from '@/lib/utils'

interface BallPickerPageProps {
  selectedId: number
  onSelect: (ball: BallView) => void
  onBack: () => void
}

/** 장식 볼 선택기 (F-CHR-06). 38종 격자에서 하나를 고른다 */
export function BallPickerPage({ selectedId, onSelect, onBack }: BallPickerPageProps) {
  const { data, isError } = useQuery(ballsQuery)

  return (
    <PageLayout
      headerLeft={<BackHeader title={strings.picker.ballTitle} onBack={onBack} />}
      className="gap-4"
    >
      <p className="text-sm text-muted-foreground">{strings.picker.ballDescription}</p>
      {isError && <p className="py-10 text-center">{strings.picker.loadError}</p>}
      <ul className="grid grid-cols-3 gap-2">
        {data?.balls.map((ball) => {
          const selected = ball.ballId === selectedId
          return (
            <li key={ball.ballId}>
              <button
                type="button"
                onClick={() => onSelect(ball)}
                aria-pressed={selected}
                className={cn(
                  'flex h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 px-1',
                  selected ? 'border-primary bg-primary/5' : 'border-transparent bg-card',
                )}
              >
                <PixelImage
                  src={ball.imageUrl}
                  alt=""
                  width={spriteSize.ball.width}
                  height={spriteSize.ball.height}
                  scale={2}
                />
                <span className="w-full truncate text-center font-game text-base">{ball.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </PageLayout>
  )
}
