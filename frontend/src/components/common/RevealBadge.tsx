import { strings } from '@/config/strings'
import { daysUntil } from '@/lib/time'

interface RevealBadgeProps {
  revealAt: string
  revealed: boolean
  now: Date
}

/** "12월 25일에 열려요 · D-23" 또는 "메시지가 열렸어요!" */
export function RevealBadge({ revealAt, revealed, now }: RevealBadgeProps) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
      {revealed
        ? strings.common.revealed
        : `${strings.common.revealDate} · ${strings.common.dDay(daysUntil(revealAt, now))}`}
    </p>
  )
}
