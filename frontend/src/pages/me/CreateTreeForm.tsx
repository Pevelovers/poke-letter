import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'

import { ApiError } from '@/api/client'
import { createTree, queryKeys } from '@/api/queries'
import { ActionButton } from '@/components/common/ActionButton'
import { TextField } from '@/components/common/TextField'
import { strings } from '@/config/strings'

const NAME_MAX = 20

/** 트리 이름을 받아 트리를 만든다 (F-TRE-01, US-01) */
export function CreateTreeForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()

  const mutation = useMutation({
    mutationFn: createTree,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    onError: (cause) => {
      // 거절돼도 입력한 이름은 지우지 않아 바로 고칠 수 있게 한다 (US-01 E1)
      if (cause instanceof ApiError && cause.code === 'INAPPROPRIATE_NAME') {
        setError(strings.me.inappropriateName)
      } else if (cause instanceof ApiError && cause.code === 'TREE_ALREADY_EXISTS') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.me })
      } else {
        setError(strings.common.networkError)
      }
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim() === '') {
      setError(strings.me.nameRequired)
      return
    }
    setError(undefined)
    mutation.mutate(name.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={strings.me.createTitle}
        placeholder={strings.me.createPlaceholder}
        value={name}
        onValueChange={(value) => {
          setName(value)
          setError(undefined)
        }}
        maxLength={NAME_MAX}
        error={error}
        autoComplete="off"
      />
      <ActionButton type="submit" pending={mutation.isPending} pendingLabel={strings.me.creating}>
        {strings.me.createSubmit}
      </ActionButton>
    </form>
  )
}
