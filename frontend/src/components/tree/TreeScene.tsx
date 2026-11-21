import type { CSSProperties } from 'react'

import type { Decoration } from '@/api/types'
import { assets, treeSprite } from '@/config/assets'
import { isDaytimeInSeoul } from '@/lib/time'
import { cn } from '@/lib/utils'

import { Ornament } from './Ornament'

/** 볼 장식 배율 (design.md §1) */
const BALL_SCALE = 2

const TREE_WIDTH = Math.round(treeSprite.frameWidth * treeSprite.scale * treeSprite.widthRatio)
const TREE_HEIGHT = treeSprite.frameHeight * treeSprite.scale

/**
 * 트리 위 장식 자리 10곳 (POL-TRE-04 한 페이지 10개).
 * 값은 화면에 그린 트리(266×387) 안에서 장식 중심의 px 좌표다.
 * 줄(1·2·3·4개)마다 가지 위에 오도록 에디터(/editor)에서 맞춘 값이다.
 * [제안] 배치 방식은 디자인 확정 전 임시값이다 (design.md "남은 결정").
 */
const SLOTS: ReadonlyArray<readonly [x: number, y: number]> = [
  [133, 86],
  [93, 161],
  [173, 161],
  [53, 237],
  [133, 230],
  [213, 237],
  [27, 307],
  [98, 301],
  [168, 301],
  [239, 307],
]

/** 스프라이트시트를 프레임 수만큼 넘기는 눈 애니메이션 값 (index.css `.tree-sprite`) */
const treeStyle = {
  width: TREE_WIDTH,
  height: TREE_HEIGHT,
  backgroundImage: `url(${treeSprite.src})`,
  backgroundSize: `${TREE_WIDTH * treeSprite.frames}px ${TREE_HEIGHT}px`,
  '--tree-sheet-end': `-${TREE_WIDTH * treeSprite.frames}px`,
  '--tree-frames': treeSprite.frames,
  '--tree-snow-duration': `${treeSprite.frames / treeSprite.fps}s`,
} as CSSProperties

interface TreeSceneProps {
  decorations: Decoration[]
  onDecorationClick?: (decoration: Decoration) => void
  now: Date
}

/** 야외 배경 + 트리 + 볼 장식. 서울 일출·일몰 기준으로 낮과 밤이 바뀐다 (F-TRE-10) */
export function TreeScene({ decorations, onDecorationClick, now }: TreeSceneProps) {
  const daytime = isDaytimeInSeoul(now)

  return (
    <div
      data-testid="tree-scene"
      data-time={daytime ? 'day' : 'night'}
      className={cn(
        // 좌우 여백 없이 화면 폭을 꽉 채운다 (페이지 본문의 px-4를 상쇄)
        'pixelated relative -mx-4 flex h-[440px] items-end justify-center overflow-hidden',
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
      <div className="relative mb-8" style={{ width: TREE_WIDTH, height: TREE_HEIGHT }}>
        <div aria-hidden className="tree-sprite absolute inset-0" style={treeStyle} />
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
                  scale={BALL_SCALE}
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
