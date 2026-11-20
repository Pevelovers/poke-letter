import type { Decoration } from '@/api/types'
import { PixelImage } from '@/components/common/PixelImage'
import { Sparkle } from '@/components/common/Sparkle'
import { spriteSize } from '@/config/assets'
import { strings } from '@/config/strings'

interface OrnamentProps {
  decoration: Decoration
  scale: 1 | 2 | 3 | 4
  onClick?: () => void
}

/** 공개 후 포켓몬 장식을 누를 수 있는 범위(px). 장식 자리 사이 가장 좁은 간격(약 54px)보다 작게 둔다 */
const HIT_BOX = 48

/**
 * 트리에 달린 장식 하나와 보낸 사람 닉네임.
 * 공개 전에는 볼(이로치가 들었으면 반짝임), 공개 후에는 볼 대신 포켓몬을 단다 (POL-RVL-03, POL-CHR-12).
 */
export function Ornament({ decoration, scale, onClick }: OrnamentProps) {
  const { character } = decoration
  const content = (
    <>
      <Sparkle active={decoration.shiny}>
        {character ? (
          // 포켓몬 이미지는 가장 큰 포켓몬에 맞춘 96칸이라 여백이 많다(그림 중앙값 54px).
          // 그림은 자르지 않고 다 보여 주되, 누르는 범위는 가운데 HIT_BOX만큼으로 줄인다.
          // 칸 밖으로 나온 그림은 pointer-events-none이라 이웃 장식을 가리지 않는다.
          <span className="relative block" style={{ width: HIT_BOX, height: HIT_BOX }}>
            <PixelImage
              src={character.imageUrl}
              alt={character.name}
              width={spriteSize.pokemon.width}
              height={spriteSize.pokemon.height}
              scale={1}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-1/2"
            />
          </span>
        ) : (
          <PixelImage
            src={decoration.ball.imageUrl}
            alt={decoration.ball.name}
            width={spriteSize.ball.width}
            height={spriteSize.ball.height}
            scale={scale}
          />
        )}
      </Sparkle>
      <span className="relative z-10 -mt-2 max-w-16 truncate rounded-full bg-background/85 px-1.5 font-game text-base leading-5 text-foreground shadow-sm">
        {decoration.nickname}
      </span>
    </>
  )

  const label = `${decoration.nickname}의 장식${decoration.shiny ? ` (${strings.picker.shinyBadge})` : ''}`
  if (!onClick) {
    return (
      <div className="flex flex-col items-center" aria-label={label}>
        {content}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center transition-transform active:scale-95"
    >
      {content}
    </button>
  )
}
