import type { Character } from '@/api/types'
import { PixelImage } from '@/components/common/PixelImage'
import { Sparkle } from '@/components/common/Sparkle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { spriteSize } from '@/config/assets'
import { strings } from '@/config/strings'

export interface PokemonCandidate {
  character: Character
  /** 확인 창을 띄울 때 뽑은 이로치 당첨 결과 */
  shiny: boolean
}

interface PokemonConfirmDialogProps {
  candidate: PokemonCandidate | null
  onConfirm: (candidate: PokemonCandidate) => void
  onCancel: () => void
}

/** "이 아이를 맡길까?" 확인 창 (POL-CHR-11, F-CHR-07) */
export function PokemonConfirmDialog({
  candidate,
  onConfirm,
  onCancel,
}: PokemonConfirmDialogProps) {
  return (
    <AlertDialog open={candidate !== null} onOpenChange={(open) => !open && onCancel()}>
      {/* size="sm"이면 PC 폭에서도 왼쪽 정렬로 바뀌지 않고 가운데 정렬을 유지한다 */}
      <AlertDialogContent size="sm">
        {candidate && (
          <>
            <AlertDialogHeader className="place-items-center text-center">
              <Sparkle active={candidate.shiny}>
                <PixelImage
                  src={
                    candidate.shiny
                      ? candidate.character.shinyImageUrl
                      : candidate.character.imageUrl
                  }
                  alt={candidate.character.name}
                  width={spriteSize.pokemon.width}
                  height={spriteSize.pokemon.height}
                  scale={2}
                  loading="eager"
                />
              </Sparkle>
              {candidate.shiny && (
                <p className="font-game text-base text-accent-foreground">
                  {strings.picker.shinyCongrats}
                </p>
              )}
              <AlertDialogDescription className="font-game text-2xl text-foreground">
                {candidate.character.name}
              </AlertDialogDescription>
              <AlertDialogTitle className="text-xl font-normal">
                {strings.picker.confirmTitle}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter className="grid grid-cols-2 gap-2">
              <AlertDialogCancel className="h-11 font-game text-base">
                {strings.picker.no}
              </AlertDialogCancel>
              <AlertDialogAction
                className="h-11 font-game text-base"
                onClick={() => onConfirm(candidate)}
              >
                {strings.picker.yes}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
