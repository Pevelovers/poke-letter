import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'

import { ApiError } from '@/api/client'
import { createMessage, queryKeys, treeQuery } from '@/api/queries'
import type { CreateMessageResponse } from '@/api/types'
import { ActionButton } from '@/components/common/ActionButton'
import { TextAreaField, TextField } from '@/components/common/TextField'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageLayout } from '@/components/layout/PageLayout'
import { SelectionSummary } from '@/components/message/SelectionSummary'
import { strings } from '@/config/strings'
import { useDraft, useDraftStore } from '@/stores/messageDraft'

const NICKNAME_MAX = 10
const CONTENT_MAX = 500

interface WritePageProps {
  treeId: string
  onBack: () => void
  onSent: (result: CreateMessageResponse) => void
}

/**
 * `/t/:treeId/write` 메시지 작성 (F-MSG-01~04, US-03).
 * 입력은 기기에 자동 저장되고(POL-MSG-05) 전송에 성공했을 때만 지운다.
 */
export function WritePage({ treeId, onBack, onSent }: WritePageProps) {
  const queryClient = useQueryClient()
  const draft = useDraft(treeId)
  const update = useDraftStore((state) => state.update)
  const clear = useDraftStore((state) => state.clear)
  const { data: tree } = useQuery(treeQuery(treeId, 0))

  const [fieldErrors, setFieldErrors] = useState<{ nickname?: string; content?: string }>({})
  const [formError, setFormError] = useState<string>()
  // 욕설로 한 번 거절된 닉네임·내용. 새로고침하면 사라지는 메모리 값이다 (POL-FLT-07)
  const [rejected, setRejected] = useState<{ nickname: string; content: string } | null>(null)

  const mutation = useMutation({
    mutationFn: ({ characterId, allowMasking }: { characterId: number; allowMasking: boolean }) =>
      createMessage(treeId, {
        nickname: draft.nickname.trim(),
        content: draft.content,
        characterId,
        shiny: draft.shiny,
        ballId: draft.ballId,
        allowMasking,
      }),
    onSuccess: (result) => {
      clear(treeId)
      void queryClient.invalidateQueries({ queryKey: queryKeys.treeAll(treeId) })
      onSent(result)
    },
    // 실패하면 쓰던 내용은 그대로 남는다
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        setRejected({ nickname: draft.nickname, content: draft.content })
        setFormError(strings.write.inappropriate)
      } else if (error instanceof ApiError && error.status === 429) {
        setFormError(strings.write.tooManyRequests(error.retryAfterSeconds))
      } else if (error instanceof ApiError && error.code === 'TREE_FULL') {
        setFormError(strings.write.treeFull)
      } else {
        setFormError(strings.write.failed)
      }
    },
  })

  const pokemonMissing = draft.characterId === null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const errors = {
      nickname: draft.nickname.trim() === '' ? strings.write.needNickname : undefined,
      content: draft.content.trim() === '' ? strings.write.needContent : undefined,
    }
    setFieldErrors(errors)
    if (errors.nickname || errors.content || draft.characterId === null) return

    // 거절된 내용을 고치지 않고 다시 누르면 서버에 보내지 않고 막는다
    if (rejected && rejected.nickname === draft.nickname && rejected.content === draft.content) {
      setFormError(strings.write.inappropriate)
      return
    }
    setFormError(undefined)
    // 거절된 뒤 고친 내용은 마스킹해서라도 보낸다
    mutation.mutate({ characterId: draft.characterId, allowMasking: rejected !== null })
  }

  return (
    <PageLayout
      headerLeft={<BackHeader title={strings.write.title} onBack={onBack} />}
      className="gap-5"
    >
      {tree && <p className="text-sm text-muted-foreground">{strings.write.to(tree.name)}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <TextField
          label={strings.write.nickname}
          placeholder={strings.write.nicknamePlaceholder}
          value={draft.nickname}
          onValueChange={(nickname) => update(treeId, { nickname })}
          maxLength={NICKNAME_MAX}
          error={fieldErrors.nickname}
          autoComplete="off"
        />
        <TextAreaField
          label={strings.write.content}
          placeholder={strings.write.contentPlaceholder}
          value={draft.content}
          onValueChange={(content) => update(treeId, { content })}
          maxLength={CONTENT_MAX}
          error={fieldErrors.content}
        />

        <SelectionSummary treeId={treeId} draft={draft} />

        <div className="flex flex-col gap-2">
          {formError && (
            <p role="alert" className="text-center text-sm text-destructive">
              {formError}
            </p>
          )}
          {pokemonMissing && (
            <p className="text-center text-sm text-muted-foreground">{strings.write.needPokemon}</p>
          )}
          <ActionButton
            type="submit"
            disabled={pokemonMissing}
            pending={mutation.isPending}
            pendingLabel={strings.write.sending}
          >
            {strings.write.send}
          </ActionButton>
          <p className="text-center text-xs text-muted-foreground">{strings.write.autosaved}</p>
        </div>
      </form>
    </PageLayout>
  )
}
