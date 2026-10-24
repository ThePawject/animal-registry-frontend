import { useState } from 'react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import type { RefObject } from 'react'
import type { Animal } from '@/api/animals/types'
import { SPECIES_MAP } from '@/api/animals/types'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { useAnimals } from '@/api/animals/queries'

const SEARCH_PAGE_SIZE = 20

const animalLabel = (animal: Animal) =>
  `${animal.name || 'Brak imienia'} (${animal.signature})`

interface AnimalPickerProps {
  id: string
  value: Animal | null
  onChange: (animal: Animal | null) => void
  container?: RefObject<HTMLElement | null>
  invalid?: boolean
}

export default function AnimalPicker({
  id,
  value,
  onChange,
  container,
  invalid,
}: AnimalPickerProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, { wait: 300 })

  const { data, isFetching } = useAnimals({
    page: 1,
    pageSize: SEARCH_PAGE_SIZE,
    keyWordSearch: debouncedQuery.trim() || null,
  })

  return (
    <Combobox
      items={data?.items ?? []}
      filter={null}
      value={value}
      onValueChange={(animal) => onChange(animal)}
      onInputValueChange={(inputValue, { reason }) => {
        if (reason === 'input-change') setQuery(inputValue)
      }}
      itemToStringLabel={animalLabel}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
    >
      <ComboboxInput
        id={id}
        placeholder="Szukaj po imieniu lub sygnaturze"
        aria-invalid={invalid || undefined}
        className="w-full bg-background"
      />
      <ComboboxContent container={container}>
        <ComboboxEmpty>
          {isFetching ? 'Szukam…' : 'Nie znaleziono zwierząt.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(animal: Animal) => (
            <ComboboxItem key={animal.id} value={animal}>
              <span className="truncate">{animalLabel(animal)}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {SPECIES_MAP[animal.species]}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
