import { useState, type ReactNode } from 'react'

import { assets } from '@/config/assets'
import { cn } from '@/lib/utils'

interface PixelImageProps {
  src: string
  alt: string
  /** 원본 크기(px) */
  width: number
  height: number
  /** 정수 배율만 허용한다 (design.md §1) */
  scale: 1 | 2 | 3 | 4
  className?: string
  /** 불러오지 못하면 보여 줄 이미지. 기본은 기본 오너먼트 (F-CHR-04) */
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  /** 이미지와 대체 이미지가 모두 실패했을 때 그릴 요소. 기본은 볼 모양의 원 */
  fallback?: ReactNode
  /**
   * 브라우저 확대 등으로 원본과 다른 크기로 그려질 때 픽셀을 섞어 부드럽게 그린다.
   * 정수배로 키우는 이미지(볼 2배 등)는 흐려지므로 쓰지 않는다
   */
  smooth?: boolean
}

/**
 * 도트 이미지. 정수 배율과 pixelated 렌더링을 지키고,
 * 이미지와 대체 이미지까지 모두 실패하면 빈 원으로 자리만 지킨다.
 */
export function PixelImage({
  src,
  alt,
  width,
  height,
  scale,
  className,
  fallbackSrc = assets.defaultOrnament,
  loading = 'lazy',
  fallback,
  smooth = false,
}: PixelImageProps) {
  const [failedSrc, setFailedSrc] = useState<string[]>([])
  const candidates = [src, fallbackSrc].filter((candidate) => !failedSrc.includes(candidate))
  const style = { width: width * scale, height: height * scale }

  if (candidates.length === 0) {
    if (fallback) return fallback
    return (
      <span
        role="img"
        aria-label={alt}
        style={style}
        className={cn('inline-block rounded-full bg-primary/70', className)}
      />
    )
  }

  return (
    <img
      key={candidates[0]}
      src={candidates[0]}
      alt={alt}
      width={style.width}
      height={style.height}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setFailedSrc((prev) => [...prev, candidates[0]])}
      className={cn(
        // 트리 장면처럼 부모가 pixelated면 물려받으므로 smooth일 때는 auto로 되돌린다
        smooth ? '[image-rendering:auto]' : 'pixelated',
        'inline-block select-none',
        className,
      )}
    />
  )
}
