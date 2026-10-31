import { useEffect, useMemo, useRef, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Eye, Plus } from 'lucide-react'
import DataTable from './DataTable'
import TablePagination from './TablePagination'
import VaccinationModal from './modals/VaccinationModal'
import VaccinationStatusBadge from './VaccinationStatusBadge'
import type { ColumnDef } from '@tanstack/react-table'
import type {
  VaccinationWithAnimal,
  ValidityFilter,
} from '@/api/vaccinations/types'
import DisabledAddon from '@/components/DisabledAddon'
import { SPECIES_MAP } from '@/api/animals/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeature } from '@/api/features/queries'
import { useExpiringVaccinations } from '@/api/vaccinations/queries'
import { VALIDITY_FILTER_MAP } from '@/api/vaccinations/types'
import { formatDate } from '@/lib/utils'

const MAX_DAYS = 3650
const DEFAULT_DAYS = 30
const CUSTOM_PERIOD = 'custom'

const EXPIRY_PERIODS = [
  { label: 'tygodnia', days: 7 },
  { label: '2 tygodni', days: 14 },
  { label: 'miesiąca', days: 30 },
  { label: '3 miesięcy', days: 90 },
  { label: 'pół roku', days: 180 },
]

export default function ExpiringVaccinations() {
  const { isEnabled, isLoading: isLoadingFeature } = useFeature(
    'animal-vaccinations',
  )
  const [days, setDays] = useState(String(DEFAULT_DAYS))
  const [isCustomPeriod, setIsCustomPeriod] = useState(false)
  const customDaysInputRef = useRef<HTMLInputElement>(null)
  const shouldFocusCustomDaysRef = useRef(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [validity, setValidity] = useState<ValidityFilter>('All')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(20)

  const expiresInDays = Number(days)
  const isExpiring = validity === 'Expiring'
  const isDaysValid =
    !isExpiring ||
    (days !== '' &&
      Number.isInteger(expiresInDays) &&
      expiresInDays >= 0 &&
      expiresInDays <= MAX_DAYS)

  const { data, isLoading, isError, isPlaceholderData } =
    useExpiringVaccinations(
      { validity, expiresInDays, inShelterOnly: false, page, pageSize },
      isEnabled && isDaysValid,
    )

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / pageSize))
    : 1

  useEffect(() => {
    if (data && !isPlaceholderData && page > totalPages) setPage(totalPages)
  }, [data, isPlaceholderData, page, totalPages])

  const columns = useMemo<Array<ColumnDef<VaccinationWithAnimal, any>>>(
    () => [
      {
        id: 'signature',
        header: 'Oznaczenie',
        cell: ({ row }) => (
          <div className="max-w-[100px] truncate">
            {row.original.animalSignature}
          </div>
        ),
      },
      {
        id: 'animalName',
        header: 'Imię',
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.original.animalName || '-'}
          </div>
        ),
      },
      {
        id: 'species',
        header: 'Gatunek',
        cell: ({ row }) => (
          <div className="max-w-[100px] truncate">
            {SPECIES_MAP[row.original.species]}
          </div>
        ),
      },
      {
        id: 'vaccineName',
        header: 'Szczepionka',
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.original.vaccination.vaccineName}
          </div>
        ),
      },
      {
        id: 'administeredOn',
        header: 'Data podania',
        cell: ({ row }) => (
          <div className="max-w-[100px] truncate">
            {formatDate(row.original.vaccination.administeredOn)}
          </div>
        ),
      },
      {
        id: 'validUntil',
        header: 'Ważne do',
        cell: ({ row }) => (
          <div className="max-w-[100px] truncate">
            {row.original.vaccination.validUntil
              ? formatDate(row.original.vaccination.validUntil)
              : '-'}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <VaccinationStatusBadge
            status={row.original.vaccination.status}
            daysUntilExpiry={row.original.vaccination.daysUntilExpiry}
          />
        ),
      },
      {
        id: 'actions',
        header: 'Akcje',
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link
              to="/animal/$animalId/vaccinations"
              params={{ animalId: row.original.vaccination.animalId }}
              className="flex items-center w-full"
            >
              <Eye className="w-4 h-4 md:mr-2" />
              <span className="sr-only md:not-sr-only">Szczegóły</span>
            </Link>
          </Button>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getRowId: (row) => row.vaccination.id,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  if (isLoadingFeature) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!isEnabled) {
    return <DisabledAddon name="Szczepienia" addonKey="animal-vaccinations" />
  }

  return (
    <div className="-mt-4 flex flex-col gap-4 mx-auto px-4 md:px-0 w-full pb-8">
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
          <div className="flex items-center gap-2">
            <Label htmlFor="validity-filter">Ważność</Label>
            <Select
              value={validity}
              onValueChange={(value) => {
                setValidity(value as ValidityFilter)
                setPage(1)
              }}
            >
              <SelectTrigger
                id="validity-filter"
                className="w-full md:w-[180px] data-[size=default]:h-10 bg-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VALIDITY_FILTER_MAP).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isExpiring && (
            <div className="flex items-center gap-2">
              <Label htmlFor="expiry-period">Wygasają w ciągu</Label>
              <Select
                value={isCustomPeriod ? CUSTOM_PERIOD : days}
                onValueChange={(value) => {
                  setIsCustomPeriod(value === CUSTOM_PERIOD)
                  shouldFocusCustomDaysRef.current = value === CUSTOM_PERIOD
                  if (value !== CUSTOM_PERIOD) setDays(value)
                  setPage(1)
                }}
              >
                <SelectTrigger
                  id="expiry-period"
                  className="w-full md:w-[160px] data-[size=default]:h-10 bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  onCloseAutoFocus={(e) => {
                    if (!shouldFocusCustomDaysRef.current) return
                    e.preventDefault()
                    shouldFocusCustomDaysRef.current = false
                    customDaysInputRef.current?.select()
                  }}
                >
                  {EXPIRY_PERIODS.map(({ label, days: periodDays }) => (
                    <SelectItem key={periodDays} value={String(periodDays)}>
                      {label}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_PERIOD}>wybór dni</SelectItem>
                </SelectContent>
              </Select>
              {isCustomPeriod && (
                <Input
                  ref={customDaysInputRef}
                  id="expires-in-days"
                  aria-label="Wygasają w ciągu (dni)"
                  type="number"
                  min={0}
                  max={MAX_DAYS}
                  value={days}
                  onChange={(e) => {
                    setDays(e.target.value)
                    setPage(1)
                  }}
                  className="h-10 w-24 bg-white"
                />
              )}
            </div>
          )}
          <Button
            className="w-full md:w-auto md:ml-auto h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="size-5" />
            Dodaj szczepienie
          </Button>
        </div>
      </div>

      {!isDaysValid && (
        <p role="alert" className="text-sm text-red-500 font-medium">
          Liczba dni musi być z zakresu od 0 do {MAX_DAYS}.
        </p>
      )}
      {isDaysValid && isError && <p>Nie udało się pobrać listy szczepień.</p>}

      <DataTable
        table={table}
        columns={columns}
        isPending={isDaysValid && isLoading}
        isPlaceholderData={isPlaceholderData}
        pageSize={pageSize}
      />

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        disabled={isLoading || isPlaceholderData}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize)
          setPage(1)
        }}
      />

      {isAddModalOpen && (
        <VaccinationModal
          open
          vaccination={null}
          renews={null}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  )
}
