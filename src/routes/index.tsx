import { createFileRoute } from '@tanstack/react-router'
import type { Species } from '@/api/animals/types'
import AnimalTable from '@/components/AnimalTable'

export type IndexSearch = {
  query?: string
  species?: Species
  isInShelter?: boolean
  page?: number
  pageSize?: 10 | 20 | 50
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    query: typeof search.query === 'string' ? search.query : undefined,
    species:
      typeof search.species === 'number' && [0, 1, 2].includes(search.species)
        ? (search.species as Species)
        : undefined,
    isInShelter:
      typeof search.isInShelter === 'boolean' ? search.isInShelter : undefined,
    page:
      typeof search.page === 'number' && search.page > 0
        ? Math.floor(search.page)
        : 1,
    pageSize: ([10, 20, 50] as const).includes(search.pageSize as 10 | 20 | 50)
      ? (search.pageSize as 10 | 20 | 50)
      : 20,
  }),
  component: App,
})

function App() {
  return <AnimalTable />
}
