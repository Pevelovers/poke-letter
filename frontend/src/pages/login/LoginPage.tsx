import { useQuery } from '@tanstack/react-query'

import { configQuery } from '@/api/queries'
import type { LoginProvider } from '@/api/types'
import { LoginButton } from '@/components/auth/LoginButton'
import { PageLayout } from '@/components/layout/PageLayout'
import { strings } from '@/config/strings'

/** 버튼 순서. 주 사용자가 카카오톡을 쓰므로 카카오를 맨 위에 둔다 */
const PROVIDER_ORDER: LoginProvider[] = ['kakao', 'naver', 'google']

/** `/login` 소셜 로그인. 설정에서 켜진 제공자만 보여 준다 (POL-ACC-02) */
export function LoginPage() {
  const { data: config } = useQuery(configQuery)
  const providers = PROVIDER_ORDER.filter((provider) => config?.loginProviders.includes(provider))

  return (
    <PageLayout className="justify-center gap-8">
      <section className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">{strings.login.title}</h1>
        <p className="whitespace-pre-line text-muted-foreground">{strings.login.description}</p>
      </section>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => (
          <LoginButton key={provider} provider={provider} />
        ))}
      </div>
    </PageLayout>
  )
}
