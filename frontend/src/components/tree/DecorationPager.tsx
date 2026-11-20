import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { PageInfo } from '@/api/types'
import { Button } from '@/components/ui/button'
import { strings } from '@/config/strings'

interface DecorationPagerProps {
  page: PageInfo
  onPageChange: (page: number) => void
}

/** 장식을 10개씩 넘겨 본다 (POL-TRE-04). 한 페이지뿐이면 숨긴다 */
export function DecorationPager({ page, onPageChange }: DecorationPagerProps) {
  if (page.totalPages <= 1) return null
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="장식 페이지">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page.number - 1)}
        disabled={page.number === 0}
        aria-label={strings.tree.prevPage}
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        {strings.tree.page(page.number + 1, page.totalPages)}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page.number + 1)}
        disabled={page.number + 1 >= page.totalPages}
        aria-label={strings.tree.nextPage}
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
