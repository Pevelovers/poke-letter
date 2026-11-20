import { LoaderCircle } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionButtonProps = ComponentProps<typeof Button> & {
  /** 요청 중이면 버튼을 막고 pendingLabel을 보여 준다 (중복 전송 방지) */
  pending?: boolean
  pendingLabel?: string
}

/**
 * 화면의 주요 행동 버튼. 모바일에서 누르기 쉽게 크고 가로를 채운다.
 * 버튼 모양을 바꿀 때는 이 컴포넌트와 테마 색(index.css)만 고친다.
 */
export function ActionButton({
  pending = false,
  pendingLabel,
  disabled,
  className,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn('h-12 w-full rounded-xl text-base font-semibold', className)}
      {...props}
    >
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
