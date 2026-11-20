import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface VirtualGridProps<T> {
  items: T[]
  columns: number
  /** 행 높이(px). 모든 칸은 같은 높이다 */
  rowHeight: number
  getKey: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  className?: string
  /** 화면 밖에 미리 그려 둘 행 수 */
  overscan?: number
}

/**
 * 보이는 행만 그리는 격자 (1,000개가 넘는 포켓몬 목록용). 라이브러리 없이 구현한다.
 * 스크롤 컨테이너의 높이는 className으로 정한다.
 */
export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  getKey,
  renderItem,
  className,
  overscan = 3,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  // jsdom처럼 높이를 잴 수 없는 환경에서도 첫 화면은 그린다
  const [viewportHeight, setViewportHeight] = useState(600)

  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.height > 0) setViewportHeight(entry.contentRect.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // 검색 결과가 바뀌면 맨 위부터 보여 준다
  useEffect(() => {
    containerRef.current?.scrollTo?.({ top: 0 })
  }, [items])

  const rowCount = Math.ceil(items.length / columns)
  const firstRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const lastRow = Math.min(rowCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan)
  const visible = items.slice(firstRow * columns, lastRow * columns)

  return (
    <div
      ref={containerRef}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      className={cn('overflow-y-auto', className)}
    >
      <ul
        className="relative grid"
        style={{
          height: rowCount * rowHeight,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: rowHeight,
          paddingTop: firstRow * rowHeight,
          boxSizing: 'border-box',
        }}
      >
        {visible.map((item) => (
          <li key={getKey(item)}>{renderItem(item)}</li>
        ))}
      </ul>
    </div>
  )
}
