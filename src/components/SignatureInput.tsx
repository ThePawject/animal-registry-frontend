import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  id?: string
}

export function SignatureInput({ value, onChange, disabled }: Props) {
  const parse = (v = '') => {
    const digits = v.replace(/\D/g, '').slice(0, 8).split('')
    return Array.from({ length: 8 }, (_, i) => digits[i] || '')
  }

  const [digits, setDigits] = useState<string[]>(() => parse(value))
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const parsed = parse(value)
    if (parsed.join('') !== digits.join('')) setDigits(parsed)
  }, [value])

  const build = (d: string[]) => {
    const left = d.slice(0, 4).join('')
    const right = d.slice(4, 8).join('')
    return left || right ? `${left}/${right}` : ''
  }

  const focusAt = (i: number) => {
    const idx = Math.max(0, Math.min(7, i))
    const el = refs.current[idx]
    if (el && !disabled) el.focus()
  }

  const changeAt = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, '').slice(-1) || ''
    setDigits((prev) => {
      const next = prev.slice()
      next[i] = ch
      onChange?.(build(next))
      return next
    })
    if (ch) focusAt(i + 1)
  }

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      setDigits((prev) => {
        const next = prev.slice()
        if (next[i]) {
          next[i] = ''
          onChange?.(build(next))
          refs.current[i]?.focus()
        } else if (i > 0) {
          refs.current[i - 1]?.focus()
        }
        return next
      })
      return
    }
    if (e.key === 'Delete') {
      e.preventDefault()
      setDigits((prev) => {
        const next = prev.slice()
        next[i] = ''
        onChange?.(build(next))
        refs.current[i]?.focus()
        return next
      })
      return
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(i - 1)
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(i + 1)
    }
  }

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '')
    if (!pasted) return
    setDigits((prev) => {
      const next = prev.slice()
      for (let k = 0; k < pasted.length && i + k < 8; k++)
        next[i + k] = pasted[k]
      onChange?.(build(next))
      return next
    })
    focusAt(i + pasted.length)
  }

  return (
    <div className="flex items-center justify-start gap-0.5 flex-wrap">
      {Array.from({ length: 4 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx]}
          onChange={(e) => changeAt(idx, e.target.value)}
          onKeyDown={(e) => onKeyDown(idx, e)}
          onPaste={(e) => onPaste(idx, e)}
          disabled={disabled}
          className={cn(
            'w-7 h-9 text-center text-base font-mono',
            'border rounded bg-background',
            'focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
            'transition-all p-0',
            disabled && 'opacity-50 cursor-not-allowed',
            !digits[idx] && 'border-muted-foreground/30',
          )}
        />
      ))}
      <div className="flex items-center justify-center px-0.5">
        <span className="text-lg font-light text-muted-foreground">/</span>
      </div>
      {Array.from({ length: 4 }).map((_, j) => {
        const i = 4 + j
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => changeAt(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => onPaste(i, e)}
            disabled={disabled}
            className={cn(
              'w-7 h-9 text-center text-base font-mono',
              'border rounded bg-background',
              'focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
              'transition-all p-0',
              disabled && 'opacity-50 cursor-not-allowed',
              !digits[i] && 'border-muted-foreground/30',
            )}
          />
        )
      })}
    </div>
  )
}

export function validateSignature(value: string): string | undefined {
  if (!value) return 'Oznaczenie jest wymagane'
  const signatureRegex = /^\d{4}\/\d{4}$/
  if (!signatureRegex.test(value))
    return 'Format oznaczenia: RRRR/NNNN (np. 2024/0001)'
  return undefined
}
