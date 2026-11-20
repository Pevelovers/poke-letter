import { useNavigate } from '@tanstack/react-router'

import { mockLogin } from '@/api/mock/handlers'
import type { LoginProvider } from '@/api/types'
import { appConfig } from '@/config/app'
import { strings } from '@/config/strings'
import { cn } from '@/lib/utils'

const providerStyle: Record<LoginProvider, string> = {
  kakao: 'bg-brand-kakao text-brand-kakao-foreground',
  naver: 'bg-brand-naver text-brand-naver-foreground',
  google: 'bg-brand-google text-brand-google-foreground border border-border',
}

/**
 * 소셜 로그인 버튼. OAuth는 브라우저 이동으로 시작한다 (api-spec §2).
 * 목 모드에서는 이동 대신 목 로그인 상태를 만들고 내 트리로 간다.
 */
export function LoginButton({ provider }: { provider: LoginProvider }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (appConfig.useMockApi) {
      mockLogin(provider)
      void navigate({ to: '/me' })
      return
    }
    window.location.assign(`/oauth2/authorization/${provider}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold transition-opacity active:opacity-80',
        providerStyle[provider],
      )}
    >
      {strings.login.providers[provider]}
    </button>
  )
}
