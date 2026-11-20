import { cn } from '@/lib/utils'

interface ToggleChipProps {
  label: string
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
}

/** 필터용 켜고 끄는 칩. 여러 개를 함께 켤 수 있다 */
export function ToggleChip({ label, pressed, onPressedChange }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'h-9 shrink-0 rounded-full border px-3 font-game text-base transition-colors',
        pressed
          ? 'border-secondary bg-secondary text-secondary-foreground'
          : 'border-border bg-card text-foreground',
      )}
    >
      {label}
    </button>
  )
}
