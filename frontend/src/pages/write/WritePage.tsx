import { PageLayout } from '@/components/layout/PageLayout'
import { SelectionSummary } from '@/components/message/SelectionSummary'
import { strings } from '@/config/strings'
import { useDraft } from '@/stores/messageDraft'

/** `/t/:treeId/write` 메시지 작성. 닉네임·내용 입력과 보내기는 #19에서 붙인다 */
export function WritePage({ treeId }: { treeId: string }) {
  const draft = useDraft(treeId)

  return (
    <PageLayout className="gap-5">
      <h1 className="text-xl font-bold">{strings.write.title}</h1>
      <SelectionSummary treeId={treeId} draft={draft} />
    </PageLayout>
  )
}
