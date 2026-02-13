import React from 'react'
import { cn } from '@/lib/utils'

interface SignatureInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
}

export function SignatureInput({
  value,
  onChange,
  disabled,
}: SignatureInputProps) {
  // Parsuj wartość na 8 pozycji (4 + 4), każda pozycja może być pusta
  const parts = value.split('/')
  const yearDigits = (parts[0] || '').split('').slice(0, 4)
  const numDigits = (parts[1] || '').split('').slice(0, 4)

  // Utwórz tablicę 8 elementów, gdzie każdy element to cyfra lub pusty string
  const digits: Array<string> = []
  for (let i = 0; i < 4; i++) {
    digits[i] = yearDigits[i] || ''
  }
  for (let i = 0; i < 4; i++) {
    digits[i + 4] = numDigits[i] || ''
  }

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const updateValue = (newDigits: Array<string>) => {
    const year = newDigits.slice(0, 4).join('')
    const num = newDigits.slice(4, 8).join('')
    const newValue = year || num ? `${year}/${num}` : ''
    onChange(newValue)
  }

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = e.target.value.replace(/\D/g, '')

    if (inputValue.length === 0) {
      return
    }

    const digit = inputValue.slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    updateValue(newDigits)

    // Przejdź do następnego pola jeśli nie jest ostatnie
    if (index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = [...digits]

      if (digits[index]) {
        // Pole ma wartość - wyczyść je i zostań w tym polu
        newDigits[index] = ''
        updateValue(newDigits)
      } else if (index > 0) {
        // Pole jest puste - przejdź do poprzedniego
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 7) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === 'Delete') {
      e.preventDefault()
      const newDigits = [...digits]
      newDigits[index] = ''
      updateValue(newDigits)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 8)

    const newDigits: Array<string> = []
    for (let i = 0; i < 8; i++) {
      newDigits[i] = pasted[i] || ''
    }
    updateValue(newDigits)

    // Focus na odpowiednie pole
    const focusIndex = Math.min(pasted.length, 7)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex items-center justify-start gap-0.5 flex-wrap">
      {/* 4 cyfry roku */}
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-7 h-9 text-center text-base font-mono',
            'border rounded bg-background',
            'focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
            'transition-all p-0',
            disabled && 'opacity-50 cursor-not-allowed',
            !digits[index] && 'border-muted-foreground/30',
          )}
        />
      ))}

      {/* Separator / */}
      <div className="flex items-center justify-center px-0.5">
        <span className="text-lg font-light text-muted-foreground">/</span>
      </div>

      {/* 4 cyfry numeru */}
      {[4, 5, 6, 7].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-7 h-9 text-center text-base font-mono',
            'border rounded bg-background',
            'focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
            'transition-all p-0',
            disabled && 'opacity-50 cursor-not-allowed',
            !digits[index] && 'border-muted-foreground/30',
          )}
        />
      ))}
    </div>
  )
}

export function validateSignature(value: string): string | undefined {
  if (!value) return 'Oznaczenie jest wymagane'
  const signatureRegex = /^\d{4}\/\d{4}$/
  if (!signatureRegex.test(value)) {
    return 'Format oznaczenia: RRRR/NNNN (np. 2024/0001)'
  }
  return undefined
}
