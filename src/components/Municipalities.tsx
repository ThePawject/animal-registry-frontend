import { useState } from 'react'
import { ArchiveIcon, PencilIcon, Undo2Icon } from 'lucide-react'
import AddMunicipalityForm from './AddMunicipalityForm'
import EmptyMunicipalitiesNotice from './EmptyMunicipalitiesNotice'
import MunicipalityModal from './modals/MunicipalityModal'
import type { Municipality } from '@/api/municipalities/types'
import DisabledAddon from '@/components/DisabledAddon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeature } from '@/api/features/queries'
import {
  useMunicipalities,
  useSetMunicipalityArchived,
} from '@/api/municipalities/queries'
import { genericErrorMessage } from '@/lib/utils'

export default function Municipalities() {
  const { isEnabled, isLoading: isLoadingFeature } = useFeature('animal-origin')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [editedMunicipality, setEditedMunicipality] =
    useState<Municipality | null>(null)

  // Archived ones are always fetched, so adding or renaming can catch
  // a duplicate of an archived municipality.
  const { data, isLoading, isError } = useMunicipalities(
    { includeArchived: true },
    isEnabled,
  )
  const {
    mutate: setArchived,
    isPending,
    variables,
    error,
  } = useSetMunicipalityArchived()

  const visibleMunicipalities = (data ?? [])
    .filter((municipality) => includeArchived || !municipality.isArchived)
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))

  if (isLoadingFeature || (isEnabled && isLoading)) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!isEnabled) {
    return (
      <DisabledAddon name="Pochodzenie zwierzęcia" addonKey="animal-origin" />
    )
  }

  if (isError || !data) {
    return <p>Nie udało się pobrać listy gmin.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Gminy</CardTitle>
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-archived"
            checked={includeArchived}
            onCheckedChange={(checked) => setIncludeArchived(checked === true)}
          />
          <Label htmlFor="include-archived">Pokaż zarchiwizowane</Label>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AddMunicipalityForm municipalities={data} />
        {visibleMunicipalities.length === 0 && <EmptyMunicipalitiesNotice />}
        <div role="list" className="flex flex-col gap-2">
          {visibleMunicipalities.map((municipality) => (
            <div
              key={municipality.id}
              role="listitem"
              className="flex items-center justify-between gap-4 rounded-md border p-3"
            >
              <div className="flex items-center gap-2">
                <span>{municipality.name}</span>
                {municipality.isArchived && (
                  <Badge variant="secondary">Zarchiwizowana</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!municipality.isArchived && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditedMunicipality(municipality)}
                  >
                    <PencilIcon />
                    Edytuj
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending && variables.id === municipality.id}
                  onClick={() =>
                    setArchived({
                      id: municipality.id,
                      isArchived: !municipality.isArchived,
                    })
                  }
                >
                  {municipality.isArchived ? <Undo2Icon /> : <ArchiveIcon />}
                  {municipality.isArchived ? 'Przywróć' : 'Archiwizuj'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500 font-medium">
            {genericErrorMessage}
          </p>
        )}
      </CardContent>
      {editedMunicipality && (
        <MunicipalityModal
          key={editedMunicipality.id}
          open
          municipality={editedMunicipality}
          municipalities={data}
          onClose={() => setEditedMunicipality(null)}
        />
      )}
    </Card>
  )
}
