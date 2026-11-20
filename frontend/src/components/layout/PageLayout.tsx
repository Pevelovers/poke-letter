import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { strings } from '@/config/strings'

import { NoticeFooter } from './NoticeFooter'

interface PageLayoutProps {
  children: ReactNode
  /** 헤더 오른쪽 (로그아웃 버튼 등) */
  headerRight?: ReactNode
  /** 헤더 왼쪽. 없으면 서비스 이름을 보여 준다 */
  headerLeft?: ReactNode
  hideHeader?: boolean
  className?: string
}

/**
 * 모든 화면의 뼈대. 모바일 폭(360px 안팎) 기준으로 그리고,
 * 데스크톱에서는 가운데 정렬된 모바일 폭으로 보여 준다 (ENV-03).
 * 비공식 고지는 모든 화면 하단에 둔다 (POL-IP-01).
 */
export function PageLayout({
  children,
  headerRight,
  headerLeft,
  hideHeader = false,
  className,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-svh justify-center bg-muted">
      <div className="flex w-full max-w-md flex-col bg-background">
        {!hideHeader && (
          <header className="flex h-14 items-center justify-between px-4">
            {headerLeft ?? (
              <Link to="/" className="text-lg font-bold text-primary">
                {strings.appName}
              </Link>
            )}
            <div className="flex items-center gap-1">{headerRight}</div>
          </header>
        )}
        <main className={cn('flex flex-1 flex-col px-4 pb-6', className)}>{children}</main>
        <NoticeFooter />
      </div>
    </div>
  )
}
