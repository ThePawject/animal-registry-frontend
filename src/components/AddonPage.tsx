import { Link } from '@tanstack/react-router'
import { FileTextIcon, PowerIcon, SyringeIcon } from 'lucide-react'
import Municipalities from './Municipalities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ADDON_REGISTRY } from '@/api/features/registry'
import { useSetFeatureState, useShelterFeatures } from '@/api/features/queries'
import { useIsShelterAdmin } from '@/hooks/RolesContext'
import { cn, genericErrorMessage } from '@/lib/utils'

function VaccinationsAddon() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szczepienia</CardTitle>
        <p className="text-muted-foreground">
          Szczepienia dodajesz na karcie każdego zwierzęcia, w zakładce
          „Szczepienia". Tutaj znajdziesz skróty do zestawień.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button
          asChild
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Link to="/vaccinations">
            <SyringeIcon />
            Terminy szczepień
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/reports" search={{ tab: 'szczepienia' }}>
            <FileTextIcon />
            Raporty szczepień
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function AddonContent({ addonKey }: { addonKey: string }) {
  switch (addonKey) {
    case 'animal-origin':
      return <Municipalities />
    case 'animal-vaccinations':
      return <VaccinationsAddon />
    default:
      return null
  }
}

export default function AddonPage({ addonKey }: { addonKey: string }) {
  const { data, isLoading } = useShelterFeatures()
  const { mutate, isPending, error } = useSetFeatureState()
  const isAdmin = useIsShelterAdmin()
  const definition = ADDON_REGISTRY[addonKey]
  const feature = data?.find((item) => item.key === addonKey)

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!definition || !feature) {
    return <p>Nie znaleziono dodatku.</p>
  }

  const Icon = definition.icon

  return (
    <div className="flex flex-col gap-8 px-8 md:px-0 pb-8">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className="size-8 text-emerald-600" />
            <CardTitle className="text-2xl">{feature.name}</CardTitle>
            <Badge
              className={cn(
                feature.isEnabled
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {feature.isEnabled ? 'Włączony' : 'Wyłączony'}
            </Badge>
          </div>
          {isAdmin && (
            <Button
              variant={feature.isEnabled ? 'outline' : 'default'}
              className={cn(
                !feature.isEnabled &&
                  'bg-emerald-600 hover:bg-emerald-700 text-white',
              )}
              disabled={isPending}
              onClick={() =>
                mutate({ key: feature.key, isEnabled: !feature.isEnabled })
              }
            >
              <PowerIcon />
              {feature.isEnabled ? 'Wyłącz dodatek' : 'Włącz dodatek'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">{feature.description}</p>
          {!isAdmin && (
            <p className="text-sm italic text-muted-foreground">
              Dodatek może włączać i wyłączać tylko administrator schroniska.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-500 font-medium">
              {genericErrorMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {feature.isEnabled && <AddonContent addonKey={addonKey} />}
    </div>
  )
}
