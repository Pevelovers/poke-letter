import type { Decoration } from '@/api/types'
import { PixelImage } from '@/components/common/PixelImage'
import { spriteSize } from '@/config/assets'

interface OrnamentProps {
  decoration: Decoration
  scale: 1 | 2 | 3 | 4
  onClick?: () => void
}

/** 트리에 달린 볼 하나. 볼 이미지와 보낸 사람 닉네임을 보여 준다 */
export function Ornament({ decoration, scale, onClick }: OrnamentProps) {
  const content = (
    <>
      <PixelImage
        src={decoration.ball.imageUrl}
        alt={decoration.ball.name}
        width={spriteSize.ball.width}
        height={spriteSize.ball.height}
        scale={scale}
      />
      <span className="-mt-2 max-w-20 truncate rounded-full bg-background/85 px-1.5 text-[11px] leading-4 font-medium text-foreground shadow-sm">
        {decoration.nickname}
      </span>
    </>
  )

  if (!onClick) {
    return <div className="flex flex-col items-center">{content}</div>
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${decoration.nickname}의 장식`}
      className="flex flex-col items-center transition-transform active:scale-95"
    >
      {content}
    </button>
  )
}
