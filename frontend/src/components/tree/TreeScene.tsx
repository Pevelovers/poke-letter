import type { Decoration } from '@/api/types'
import { PixelImage } from '@/components/common/PixelImage'
import { assets, spriteSize } from '@/config/assets'
import { isDaytimeInSeoul } from '@/lib/time'
import { cn } from '@/lib/utils'

import { Ornament } from './Ornament'

/** 화면 전체 도트 배율. 트리·배경·볼을 같은 배율로 맞춘다 (design.md §1) */
const SCALE = 2

/**
 * 트리 위 장식 자리 10곳 (POL-TRE-04 한 페이지 10개).
 * 값은 2배율 트리 이미지(300×360) 안에서 볼 중심의 px 좌표다.
 * [제안] 배치 방식은 디자인 확정 전 임시값이다 (design.md "남은 결정").
 */
const SLOTS: ReadonlyArray<readonly [x: number, y: number]> = [
  [150, 112],
  [108, 166],
  [192, 166],
  [84, 222],
  [150, 206],
  [216, 222],
  [60, 278],
  [124, 270],
  [178, 274],
  [240, 280],
]

interface TreeSceneProps {
  decorations: Decoration[]
  onDecorationClick?: (decoration: Decoration) => void
  now: Date
}

/** 야외 배경 + 트리 + 볼 장식. 서울 일출·일몰 기준으로 낮과 밤이 바뀐다 (F-TRE-10) */
export function TreeScene({ decorations, onDecorationClick, now }: TreeSceneProps) {
  const daytime = isDaytimeInSeoul(now)
  const treeWidth = spriteSize.tree.width * SCALE
  const treeHeight = spriteSize.tree.height * SCALE

  return (
    <div
      data-testid="tree-scene"
      data-time={daytime ? 'day' : 'night'}
      className={cn(
        'pixelated relative flex h-[440px] items-end justify-center overflow-hidden rounded-2xl',
        daytime ? 'bg-scene-sky-day' : 'bg-scene-sky-night',
      )}
      style={{
        backgroundImage: `url(${daytime ? assets.backgroundDay : assets.backgroundNight})`,
        backgroundSize: '360px 640px',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'repeat-x',
      }}
    >
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-scene-snow/60" />
      <div className="relative mb-8" style={{ width: treeWidth, height: treeHeight }}>
        <PixelImage
          src={assets.tree}
          fallbackSrc={assets.tree}
          alt=""
          width={spriteSize.tree.width}
          height={spriteSize.tree.height}
          scale={SCALE}
          loading="eager"
          className="absolute inset-0"
          fallback={<TreeShape />}
        />
        <ul aria-label="장식">
          {decorations.slice(0, SLOTS.length).map((decoration, index) => {
            const [x, y] = SLOTS[index]
            return (
              // 크기 0인 칸에서 가운데 정렬해 자리 중심에 둔다. translate를 쓰면 장식마다
              // 쌓임 맥락이 생겨 닉네임이 다음 장식의 그림 아래로 깔린다
              <li
                key={decoration.messageId}
                className="absolute flex size-0 items-center justify-center"
                style={{ left: x, top: y }}
              >
                <Ornament
                  decoration={decoration}
                  scale={SCALE}
                  onClick={onDecorationClick && (() => onDecorationClick(decoration))}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** 임시 트리 이미지가 없을 때(저장소를 새로 받은 경우) 그리는 단순한 트리 */
function TreeShape() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-end">
      <div
        className="h-[300px] w-[280px] bg-scene-tree"
        style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
      />
      <div className="h-12 w-9 bg-amber-900" />
    </div>
  )
}
