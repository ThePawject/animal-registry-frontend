import ReportCard from './ReportCard'
import { useReportsDump } from '@/api/reports/queries'
import { createAndDownloadReport, genericErrorMessage } from '@/lib/utils'

export default function AnimalsDumpReportCard() {
  const { mutate, isPending, error } = useReportsDump(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )

  return (
    <ReportCard
      title="Wszystkie zwierzęta"
      description="Eksport tekstowy danych wszystkich zwierząt do PDF (bez zdjęć)."
      onSubmit={() => mutate()}
      isPending={isPending}
      error={error ? genericErrorMessage : null}
    />
  )
}
