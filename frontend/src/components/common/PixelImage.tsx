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
      className={cn('pixelated inline-block select-none', className)}
    />
  )
}
