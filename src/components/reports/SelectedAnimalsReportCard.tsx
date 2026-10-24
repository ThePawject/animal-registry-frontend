import { useState } from 'react'
import { ListChecksIcon } from 'lucide-react'
import SelectAnimalsModal from '../modals/SelectAnimalsModal'
import ReportCard from './ReportCard'
import type { SelectedAnimals } from '../modals/SelectAnimalsModal'
import { Button } from '@/components/ui/button'
import { useReportsBySelectedIds } from '@/api/reports/queries'
import { createAndDownloadReport, genericErrorMessage } from '@/lib/utils'

const PREVIEW_COUNT = 3

interface SelectedAnimalsReportCardProps {
  selected: SelectedAnimals
  onSelectedChange: (selected: SelectedAnimals) => void
}

export default function SelectedAnimalsReportCard({
  selected,
  onSelectedChange,
}: SelectedAnimalsReportCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { mutate, isPending, error } = useReportsBySelectedIds(
    ({ blob, filename }) => createAndDownloadReport(blob, filename),
  )

  const selectedAnimals = [...selected.values()]
  const preview = selectedAnimals
    .slice(0, PREVIEW_COUNT)
    .map((animal) => animal.name || animal.signature)
    .join(', ')
  const remaining = selectedAnimals.length - PREVIEW_COUNT

  return (
    <>
      <ReportCard
        title="Wybrane zwierzęta"
        description="PDF z danymi i zdjęciami wybranych zwierząt (siatka zdjęć)."
        onSubmit={() => mutate({ ids: [...selected.keys()] })}
        isPending={isPending}
        disabled={selected.size === 0}
        error={error ? genericErrorMessage : null}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {selected.size === 0
              ? 'Nie wybrano jeszcze żadnego zwierzęcia.'
              : `Wybrano ${selected.size}: ${preview}${remaining > 0 ? ` i ${remaining} więcej` : ''}`}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            <ListChecksIcon />
            {selected.size === 0 ? 'Wybierz zwierzęta' : 'Zmień wybór'}
          </Button>
        </div>
      </ReportCard>
      {isModalOpen && (
        <SelectAnimalsModal
          open
          selected={selected}
          onSelectedChange={onSelectedChange}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
