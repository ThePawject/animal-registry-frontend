import { useState } from 'react'
import {
  ExternalLink,
  PencilIcon,
  Plus,
  RefreshCwIcon,
  Syringe,
  Trash2Icon,
} from 'lucide-react'
import VaccinationModal from '../modals/VaccinationModal'
import VaccinationStatusBadge from '../VaccinationStatusBadge'
import type { AnimalById } from '@/api/animals/types'
import type { AnimalVaccination } from '@/api/vaccinations/types'
import DisabledAddon from '@/components/DisabledAddon'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeature } from '@/api/features/queries'
import {
  useAnimalVaccinations,
  useDeleteVaccination,
} from '@/api/vaccinations/queries'
import { formatDate } from '@/lib/utils'

interface InfoProps {
  label: string
  value: string | null
}

function Info({ label, value }: InfoProps) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground uppercase font-medium">
        {label}
      </span>
      <span className="font-semibold wrap-break-word">{value}</span>
    </div>
  )
}

const describeVaccination = (
  vaccinations: Array<AnimalVaccination>,
  id: string | null,
) => {
  const found = vaccinations.find((item) => item.id === id)
  return found
    ? `${found.vaccineName} (${formatDate(found.administeredOn)})`
    : null
}

export default function AnimalVaccinationsTab({
  animal,
}: {
  animal: AnimalById
}) {
  const { isEnabled, isLoading: isLoadingFeature } = useFeature(
    'animal-vaccinations',
  )
  const { data, isLoading, isError } = useAnimalVaccinations(
    animal.id,
    isEnabled,
  )
  const { mutate: deleteVaccination, error: deleteError } =
    useDeleteVaccination()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editedVaccination, setEditedVaccination] =
    useState<AnimalVaccination | null>(null)
  const [renewedVaccination, setRenewedVaccination] =
    useState<AnimalVaccination | null>(null)
  const [vaccinationToDelete, setVaccinationToDelete] =
    useState<AnimalVaccination | null>(null)

  const openModal = (
    vaccination: AnimalVaccination | null,
    renews: AnimalVaccination | null = null,
  ) => {
    setEditedVaccination(vaccination)
    setRenewedVaccination(renews)
    setIsModalOpen(true)
  }

  if (isLoadingFeature || (isEnabled && isLoading)) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!isEnabled) {
    return <DisabledAddon name="Szczepienia" addonKey="animal-vaccinations" />
  }

  if (isError || !data) {
    return <p>Nie udało się pobrać listy szczepień.</p>
  }

  return (
    <Card className="max-w-full w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Szczepienia</h2>

        <Button
          onClick={() => openModal(null)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="size-5" /> Dodaj szczepienie
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {data.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Brak szczepień.
          </p>
        )}
        {data.map((vaccination) => (
          <div
            key={vaccination.id}
            className="flex flex-col gap-4 rounded-md border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Syringe className="size-6 text-emerald-500" />
                <span className="text-xl font-semibold">
                  {vaccination.vaccineName}
                </span>
                <VaccinationStatusBadge
                  status={vaccination.status}
                  daysUntilExpiry={vaccination.daysUntilExpiry}
                />
              </div>
              <div className="flex items-center gap-2">
                {vaccination.status !== 3 && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => openModal(null, vaccination)}
                  >
                    <RefreshCwIcon />
                    Odnów
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal(vaccination)}
                >
                  <PencilIcon />
                  Edytuj
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  onClick={() => setVaccinationToDelete(vaccination)}
                >
                  <Trash2Icon />
                  Usuń
                </Button>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Info
                label="Data podania"
                value={formatDate(vaccination.administeredOn)}
              />
              <Info
                label="Ważne do"
                value={
                  vaccination.validUntil
                    ? formatDate(vaccination.validUntil)
                    : null
                }
              />
              <Info
                label="Lekarz weterynarii"
                value={vaccination.veterinarian}
              />
              <Info label="Numer serii" value={vaccination.batchNumber} />
            </div>
            <Info label="Notatka" value={vaccination.notes} />
            <Info
              label="Zastępuje"
              value={describeVaccination(
                data,
                vaccination.replacesVaccinationId,
              )}
            />
            <Info
              label="Zastąpione przez"
              value={describeVaccination(
                data,
                vaccination.replacedByVaccinationId,
              )}
            />
            {vaccination.attachment && (
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1 cursor-pointer w-fit"
                onClick={() =>
                  window.open(vaccination.attachment!.url, '_blank')
                }
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {vaccination.attachment.fileName}
                </span>
              </button>
            )}
          </div>
        ))}
        {deleteError && (
          <p role="alert" className="text-sm text-red-500 font-medium">
            Nie udało się usunąć szczepienia.
          </p>
        )}
      </div>

      {isModalOpen && (
        <VaccinationModal
          key={editedVaccination?.id ?? renewedVaccination?.id ?? 'new'}
          open={isModalOpen}
          animalId={animal.id}
          vaccination={editedVaccination}
          renews={renewedVaccination}
          animalVaccinations={data}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <Dialog
        open={vaccinationToDelete !== null}
        onOpenChange={(openState) => {
          if (!openState) setVaccinationToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć szczepienie „
              {vaccinationToDelete?.vaccineName}"? Ta operacja jest
              nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setVaccinationToDelete(null)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (vaccinationToDelete) {
                  deleteVaccination({
                    animalId: animal.id,
                    vaccinationId: vaccinationToDelete.id,
                  })
                }
                setVaccinationToDelete(null)
              }}
            >
              Usuń
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
