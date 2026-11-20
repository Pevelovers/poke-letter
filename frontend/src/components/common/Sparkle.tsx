import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** 반짝임 위치(%)와 지연(s). 이로치 표시에 쓴다 (POL-CHR-12) */
const STARS: ReadonlyArray<readonly [left: number, top: number, delay: number]> = [
  [8, 12, 0],
  [78, 6, 0.4],
  [88, 62, 0.8],
  [18, 78, 1.2],
]

/** 자식 요소 위에 반짝이는 별을 띄운다. active가 아니면 자식만 그린다 */
export function Sparkle({
  active,
  children,
  className,
}: {
  active: boolean
  children: ReactNode
  className?: string
}) {
  if (!active) return <>{children}</>
  return (
    <span className={cn('relative inline-flex', className)} data-shiny="true">
      {children}
      {STARS.map(([left, top, delay]) => (
        <span
          key={`${left}-${top}`}
          aria-hidden
          className="pointer-events-none absolute size-2.5 animate-ping text-accent"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
        >
          <svg viewBox="0 0 10 10" className="size-full fill-current">
            <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" />
          </svg>
        </span>
      ))}
    </span>
  )
}
