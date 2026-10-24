import { useState } from 'react'
import { Building2, Calendar, LogIn, MapPin } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import EmptyMunicipalitiesNotice from './EmptyMunicipalitiesNotice'
import { FormField } from './FormField'
import type { AnimalOriginForm } from '@/api/animals/types'
import { ADMISSION_METHOD_MAP } from '@/api/animals/types'
import { useMunicipalities } from '@/api/municipalities/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STREET_MAX_LENGTH = 200

const ADMISSION_METHOD_OPTIONS = Object.entries(ADMISSION_METHOD_MAP)
  .filter(([value]) => value !== '0')
  .map(([value, label]) => ({ value, label }))

export const validateAnimalOrigin = (origin: AnimalOriginForm) => {
  const errors: Partial<Record<keyof AnimalOriginForm, string>> = {}
  if (!origin.admissionDate) {
    errors.admissionDate = 'Data przyjęcia jest wymagana'
  }
  if (origin.admissionMethod === 0) {
    errors.admissionMethod = 'Sposób przyjęcia jest wymagany'
  }
  if (!origin.foundStreet.trim()) {
    errors.foundStreet = 'Miejsce znalezienia jest wymagane'
  } else if (origin.foundStreet.length > STREET_MAX_LENGTH) {
    errors.foundStreet = `Miejsce znalezienia może mieć maksymalnie ${STREET_MAX_LENGTH} znaków`
  }
  if (!origin.foundMunicipalityId) {
    errors.foundMunicipalityId = 'Gmina znalezienia jest wymagana'
  }
  if (!origin.contractorMunicipalityId) {
    errors.contractorMunicipalityId = 'Gmina zlecająca jest wymagana'
  }
  return errors
}

interface AnimalOriginFieldsProps {
  value: AnimalOriginForm
  onChange: (value: AnimalOriginForm) => void
  showAllErrors: boolean
}

export default function AnimalOriginFields({
  value,
  onChange,
  showAllErrors,
}: AnimalOriginFieldsProps) {
  const [touched, setTouched] = useState<Set<keyof AnimalOriginForm>>(new Set())
  const { data: municipalities = [], isSuccess } = useMunicipalities({
    includeArchived: false,
  })
  const errors = validateAnimalOrigin(value)

  const getError = (name: keyof AnimalOriginForm) =>
    showAllErrors || touched.has(name) ? errors[name] : undefined

  const update = <TKey extends keyof AnimalOriginForm>(
    name: TKey,
    fieldValue: AnimalOriginForm[TKey],
  ) => {
    setTouched((prev) => new Set(prev).add(name))
    onChange({ ...value, [name]: fieldValue })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Pochodzenie zwierzęcia</h3>

      {isSuccess && municipalities.length === 0 && (
        <EmptyMunicipalitiesNotice>
          <Button
            asChild
            className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Link to="/addons/$addonKey" params={{ addonKey: 'animal-origin' }}>
              Przejdź do listy gmin
            </Link>
          </Button>
        </EmptyMunicipalitiesNotice>
      )}

      <FormField
        icon={Calendar}
        label="Data przyjęcia"
        error={getError('admissionDate')}
      >
        <Input
          min="2000-01-01"
          type="date"
          value={value.admissionDate}
          onChange={(e) => update('admissionDate', e.target.value)}
          id="Data przyjęcia"
          className="bg-background"
        />
      </FormField>

      <FormField
        icon={LogIn}
        label="Sposób przyjęcia"
        error={getError('admissionMethod')}
      >
        <Select
          value={
            value.admissionMethod === 0 ? '' : String(value.admissionMethod)
          }
          onValueChange={(method) =>
            update(
              'admissionMethod',
              Number(method) as AnimalOriginForm['admissionMethod'],
            )
          }
        >
          <SelectTrigger className="bg-background w-full">
            <SelectValue placeholder="Wybierz sposób przyjęcia" />
          </SelectTrigger>
          <SelectContent>
            {ADMISSION_METHOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        icon={MapPin}
        label="Miejsce znalezienia"
        error={getError('foundStreet')}
      >
        <Input
          value={value.foundStreet}
          onChange={(e) => update('foundStreet', e.target.value)}
          id="Miejsce znalezienia"
          className="bg-background"
          placeholder="Wpisz ulicę, przy której znaleziono zwierzę"
        />
      </FormField>

      <FormField
        icon={Building2}
        label="Gmina znalezienia"
        error={getError('foundMunicipalityId')}
      >
        <Select
          value={value.foundMunicipalityId}
          onValueChange={(id) => update('foundMunicipalityId', id)}
        >
          <SelectTrigger className="bg-background w-full">
            <SelectValue placeholder="Wybierz gminę" />
          </SelectTrigger>
          <SelectContent>
            {municipalities.map((municipality) => (
              <SelectItem key={municipality.id} value={municipality.id}>
                {municipality.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        icon={Building2}
        label="Gmina zlecająca"
        error={getError('contractorMunicipalityId')}
      >
        <Select
          value={value.contractorMunicipalityId}
          onValueChange={(id) => update('contractorMunicipalityId', id)}
        >
          <SelectTrigger className="bg-background w-full">
            <SelectValue placeholder="Wybierz gminę" />
          </SelectTrigger>
          <SelectContent>
            {municipalities.map((municipality) => (
              <SelectItem key={municipality.id} value={municipality.id}>
                {municipality.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  )
}
