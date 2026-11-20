import { createFileRoute } from '@tanstack/react-router'

import { PokemonPickerPage } from '@/pages/picker/PokemonPickerPage'
import { useDraft, useDraftStore } from '@/stores/messageDraft'

export const Route = createFileRoute('/t/$treeId/write/pokemon')({
  component: PokemonPickerRoute,
})

/** 고른 포켓몬은 작성 중인 메시지에 저장하고 작성 화면으로 돌아간다 */
function PokemonPickerRoute() {
  const { treeId } = Route.useParams()
  const navigate = Route.useNavigate()
  const draft = useDraft(treeId)
  const update = useDraftStore((state) => state.update)
  const back = () => void navigate({ to: '..' })

  return (
    <PokemonPickerPage
      selectedId={draft.random ? null : draft.characterId}
      onSelect={(character) => {
        update(treeId, { characterId: character.characterId, random: false })
        back()
      }}
      onBack={back}
    />
  )
}
