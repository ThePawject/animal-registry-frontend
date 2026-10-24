import { useRef, useState } from 'react'
import { CircleCheckIcon, LucideLoaderCircle, PlusIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Municipality } from '@/api/municipalities/types'
import { validateMunicipalityName } from '@/api/municipalities/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddMunicipality } from '@/api/municipalities/queries'
import { genericErrorMessage } from '@/lib/utils'

interface AddMunicipalityFormProps {
  municipalities: Array<Municipality>
}

export default function AddMunicipalityForm({
  municipalities,
}: AddMunicipalityFormProps) {
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [addedName, setAddedName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    mutate: addMunicipality,
    isPending,
    error,
    reset,
  } = useAddMunicipality()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errorMessage = validateMunicipalityName(name, municipalities) ?? null
    setValidationError(errorMessage)
    if (errorMessage) return

    addMunicipality(name.trim(), {
      onSuccess: (municipality) => {
        setName('')
        setAddedName(municipality.name)
        inputRef.current?.focus()
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-md border bg-muted/30 p-4"
    >
      <Label htmlFor="Nazwa nowej gminy">Dodaj gminę</Label>
      <div className="flex flex-wrap items-start gap-2">
        <Input
          ref={inputRef}
          id="Nazwa nowej gminy"
          value={name}
          placeholder="Wpisz nazwę gminy"
          onChange={(e) => {
            setName(e.target.value)
            setValidationError(null)
            setAddedName(null)
            reset()
          }}
          className="min-w-48 flex-1 bg-background"
          aria-invalid={validationError ? true : undefined}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isPending ? (
            <LucideLoaderCircle className="animate-spin" />
          ) : (
            <PlusIcon />
          )}
          Dodaj
        </Button>
      </div>
      {validationError && (
        <p role="alert" className="text-sm text-red-500 font-medium">
          {validationError}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-500 font-medium">
          {genericErrorMessage}
        </p>
      )}
      {addedName && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm font-medium text-emerald-700"
        >
          <CircleCheckIcon className="size-4 shrink-0" />
          Dodano gminę „{addedName}”.
        </p>
      )}
    </form>
  )
}
