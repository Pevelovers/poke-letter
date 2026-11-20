import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { ballsQuery, charactersQuery } from '@/api/queries'
import { PixelImage } from '@/components/common/PixelImage'
import { Sparkle } from '@/components/common/Sparkle'
import { spriteSize } from '@/config/assets'
import { strings } from '@/config/strings'
import type { MessageDraft } from '@/stores/messageDraft'

interface SelectionSummaryProps {
  treeId: string
  draft: MessageDraft
}

/** 작성 화면에서 고른 포켓몬과 볼을 보여 주고, 누르면 각 선택기로 간다 */
export function SelectionSummary({ treeId, draft }: SelectionSummaryProps) {
  const { data: characters } = useQuery(charactersQuery)
  const { data: balls } = useQuery(ballsQuery)
  const character = characters?.characters.find((item) => item.characterId === draft.characterId)
  const ball = balls?.balls.find((item) => item.ballId === draft.ballId)

  return (
    <div className="flex flex-col gap-2">
      {
        <SelectionRow
          to="/t/$treeId/write/pokemon"
          treeId={treeId}
          label={strings.write.pokemon}
          value={
            character
              ? `${character.name}${draft.shiny ? ` · ${strings.picker.shinyBadge}` : ''}`
              : strings.write.choosePokemon
          }
          image={
            character && (
              <Sparkle active={draft.shiny}>
                <PixelImage
                  src={draft.shiny ? character.shinyImageUrl : character.imageUrl}
                  alt=""
                  width={spriteSize.pokemon.width}
                  height={spriteSize.pokemon.height}
                  scale={1}
                  className="-my-4"
                />
              </Sparkle>
            )
          }
        />
      }
      <SelectionRow
        to="/t/$treeId/write/ball"
        treeId={treeId}
        label={strings.write.ball}
        value={ball?.name ?? ''}
        image={
          ball && (
            <PixelImage
              src={ball.imageUrl}
              alt=""
              width={spriteSize.ball.width}
              height={spriteSize.ball.height}
              scale={2}
            />
          )
        }
      />
    </div>
  )
}

function SelectionRow({
  to,
  treeId,
  label,
  value,
  image,
}: {
  to: '/t/$treeId/write/pokemon' | '/t/$treeId/write/ball'
  treeId: string
  label: string
  value: string
  image: ReactNode
}) {
  return (
    <Link
      to={to}
      params={{ treeId }}
      className="flex h-16 items-center gap-3 rounded-xl border border-border bg-card px-4"
    >
      <span className="w-14 shrink-0 text-sm font-medium">{label}</span>
      <span className="flex size-16 items-center justify-center">{image}</span>
      <span className="flex-1 truncate">{value}</span>
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
    </Link>
  )
}
