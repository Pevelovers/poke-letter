import { useId, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { countChars } from '@/lib/text'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  id: string
  label: string
  value: string
  maxLength: number
  error?: string
  children: React.ReactNode
}

/** 라벨, 글자 수(`12/20`), 오류 문구를 같은 모양으로 감싼다 (F-MSG-03) */
function FieldShell({ id, label, value, maxLength, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {countChars(value)}/{maxLength}
        </span>
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

type TextFieldProps = Omit<ComponentProps<typeof Input>, 'onChange' | 'value' | 'maxLength'> & {
  label: string
  value: string
  onValueChange: (value: string) => void
  /** 글자 수 제한. 이모지도 한 글자로 센다 */
  maxLength: number
  error?: string
}

/** 한 줄 입력. 제한을 넘는 입력은 받지 않는다 */
export function TextField({
  label,
  value,
  onValueChange,
  maxLength,
  error,
  className,
  ...props
}: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} value={value} maxLength={maxLength} error={error}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onValueChange(limitChars(event.target.value, maxLength))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn('h-12 rounded-xl bg-card text-base', className)}
        {...props}
      />
    </FieldShell>
  )
}

type TextAreaFieldProps = Omit<
  ComponentProps<typeof Textarea>,
  'onChange' | 'value' | 'maxLength'
> & {
  label: string
  value: string
  onValueChange: (value: string) => void
  maxLength: number
  error?: string
}

/** 여러 줄 입력. 줄바꿈을 허용한다 (POL-MSG-01) */
export function TextAreaField({
  label,
  value,
  onValueChange,
  maxLength,
  error,
  className,
  ...props
}: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} value={value} maxLength={maxLength} error={error}>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onValueChange(limitChars(event.target.value, maxLength))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn('min-h-40 rounded-xl bg-card text-base', className)}
        {...props}
      />
    </FieldShell>
  )
}

function limitChars(value: string, maxLength: number): string {
  return countChars(value) > maxLength ? Array.from(value).slice(0, maxLength).join('') : value
}
