import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { configQuery, meQuery, treeQuery } from '@/api/queries'
import type { MeResponse } from '@/api/types'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { RevealBadge } from '@/components/common/RevealBadge'
import { PageLayout } from '@/components/layout/PageLayout'
import { DecorationPager } from '@/components/tree/DecorationPager'
import { ShareButton } from '@/components/tree/ShareButton'
import { TreeScene } from '@/components/tree/TreeScene'
import { strings } from '@/config/strings'
import { useNow } from '@/hooks/useNow'

import { CreateTreeForm } from './CreateTreeForm'

/** `/me` 내 트리. 트리가 없으면 만들기, 있으면 트리와 공유 버튼 (US-01, US-02, US-04) */
export function MyTreePage() {
  const me = useQuery(meQuery)

  if (me.error instanceof ApiError && me.error.status === 401) {
    return <Navigate to="/login" />
  }

  return (
    <PageLayout headerRight={<LogoutButton />} className="gap-5">
      {me.isPending && <p className="py-20 text-center">{strings.common.loading}</p>}
      {me.isError && <p className="py-20 text-center">{strings.common.networkError}</p>}
      {me.data && (
        <>
          <p className="text-sm text-muted-foreground">
            {strings.me.loggedInWith[me.data.provider]}
          </p>
          {me.data.tree ? <MyTree tree={me.data.tree} /> : <CreateTreeForm />}
        </>
      )}
    </PageLayout>
  )
}

function MyTree({ tree }: { tree: NonNullable<MeResponse['tree']> }) {
  const [page, setPage] = useState(0)
  const [lockedNotice, setLockedNotice] = useState(false)
  const now = useNow()
  const { data: config } = useQuery(configQuery)
  const { data } = useQuery({ ...treeQuery(tree.treeId, page), placeholderData: keepPreviousData })

  const showLockedNotice = () => {
    // 공개 전에는 장식을 눌러도 내용을 보여 주지 않는다 (POL-RVL-01)
    setLockedNotice(true)
    window.setTimeout(() => setLockedNotice(false), 2000)
  }

  return (
    <>
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl">{tree.name}</h1>
        {config && (
          <RevealBadge revealAt={config.revealAt} revealed={data?.revealed ?? false} now={now} />
        )}
        <p className="text-sm text-muted-foreground">
          {strings.me.messageCount(data?.messageCount ?? tree.messageCount)}
        </p>
      </section>

      <div className="relative">
        <TreeScene
          decorations={data?.decorations ?? []}
          now={now}
          onDecorationClick={data?.revealed ? undefined : showLockedNotice}
        />
        {lockedNotice && (
          <p
            role="status"
            className="absolute inset-x-6 top-4 rounded-xl bg-foreground/85 px-4 py-2 text-center text-sm text-background"
          >
            {strings.me.lockedMessage}
          </p>
        )}
      </div>

      {data && data.messageCount === 0 && (
        <p className="text-center text-sm text-muted-foreground">{strings.me.emptyTree}</p>
      )}
      {data && <DecorationPager page={data.page} onPageChange={setPage} />}

      <ShareButton treeId={tree.treeId} treeName={tree.name} />
    </>
  )
}
