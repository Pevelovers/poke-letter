import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { strings } from '@/config/strings'

/** 헤더 왼쪽의 뒤로 가기 버튼과 화면 제목 */
export function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label={strings.common.back}>
        <ChevronLeft className="size-5" />
      </Button>
      <h1 className="text-lg font-bold">{title}</h1>
    </div>
  )
}
