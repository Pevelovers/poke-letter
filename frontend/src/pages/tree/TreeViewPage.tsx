import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { configQuery, treeQuery } from '@/api/queries'
import { ActionButton } from '@/components/common/ActionButton'
import { RevealBadge } from '@/components/common/RevealBadge'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { DecorationPager } from '@/components/tree/DecorationPager'
import { TreeScene } from '@/components/tree/TreeScene'
import { strings } from '@/config/strings'
import { useNow } from '@/hooks/useNow'

/** `/t/:treeId` 공유 링크로 들어온 트리 보기 (US-03, F-TRE-03) */
export function TreeViewPage({ treeId }: { treeId: string }) {
  const [page, setPage] = useState(0)
  const now = useNow()
  const { data: config } = useQuery(configQuery)
  const tree = useQuery({ ...treeQuery(treeId, page), placeholderData: keepPreviousData })

  if (tree.error instanceof ApiError && tree.error.status === 404) {
    return <TreeNotFound />
  }

  return (
    <PageLayout
      className="gap-5"
      headerRight={
        tree.data?.isOwner && (
          // 주인이 공유 링크로 들어와도 관리 화면으로 갈 수 있다 (US-04 E2)
          <Button variant="ghost" size="sm" asChild>
            <Link to="/me">{strings.treeView.manageMyTree}</Link>
          </Button>
        )
      }
    >
      {tree.isPending && <p className="py-20 text-center">{strings.common.loading}</p>}
      {tree.isError && !tree.data && (
        <p className="py-20 text-center">{strings.common.networkError}</p>
      )}
      {tree.data && (
        <>
          <section className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">{tree.data.name}</h1>
            {config && (
              <RevealBadge revealAt={config.revealAt} revealed={tree.data.revealed} now={now} />
            )}
            <p className="text-sm text-muted-foreground">
              {strings.me.messageCount(tree.data.messageCount)}
            </p>
          </section>

          <TreeScene decorations={tree.data.decorations} now={now} />
          <DecorationPager page={tree.data.page} onPageChange={setPage} />

          {tree.data.full ? (
            // 가득 찬 트리는 버튼 대신 안내만 보여 준다 (D-03, F-TRE-09)
            <p className="rounded-xl bg-muted py-4 text-center font-medium">
              {strings.treeView.full}
            </p>
          ) : (
            <ActionButton asChild>
              <Link to="/t/$treeId/write" params={{ treeId }}>
                {strings.treeView.leaveMessage}
              </Link>
            </ActionButton>
          )}
        </>
      )}
    </PageLayout>
  )
}

/** 없는 트리 (오타, 탈퇴한 트리). US-03 E6 */
function TreeNotFound() {
  return (
    <PageLayout className="items-center justify-center gap-3 text-center">
      <h1 className="text-xl font-bold">{strings.treeView.notFoundTitle}</h1>
      <p className="text-muted-foreground">{strings.treeView.notFoundDescription}</p>
      <ActionButton asChild className="mt-4">
        <Link to="/login">{strings.treeView.createMine}</Link>
      </ActionButton>
    </PageLayout>
  )
}
