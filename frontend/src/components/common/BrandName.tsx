import { Fragment } from 'react'

import { strings } from '@/config/strings'
import { cn } from '@/lib/utils'

/**
 * 서비스 이름. 어디에 나오든 게임 문구 글꼴(Pokemon DPPt)로 그린다.
 * 일반 문구 글꼴(원스토어 모바일POP체)에는 'é'가 없어서 이름이 깨져 보이기 때문이다.
 */
export function BrandName({ className }: { className?: string }) {
  return <span className={cn('font-game', className)}>{strings.appName}</span>
}

/** 문구 안의 `{brand}` 자리를 BrandName으로 바꿔 그린다 */
export function WithBrand({ text }: { text: string }) {
  const parts = text.split('{brand}')
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <BrandName />}
          {part}
        </Fragment>
      ))}
    </>
  )
}
