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
          // [결정 필요] 포켓몬(96px)은 볼보다 커서 1배로 단다 (design.md §3-1)
          <PixelImage
            src={character.imageUrl}
            alt={character.name}
            width={spriteSize.pokemon.width}
            height={spriteSize.pokemon.height}
            scale={1}
            className="-my-4"
          />
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
      <span className="-mt-2 max-w-16 truncate rounded-full bg-background/85 px-1.5 font-game text-base leading-5 text-foreground shadow-sm">
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
