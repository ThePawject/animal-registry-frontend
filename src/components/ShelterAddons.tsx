import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, PuzzleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ADDON_REGISTRY } from '@/api/features/registry'
import { useShelterFeatures } from '@/api/features/queries'
import { cn } from '@/lib/utils'

const getSummary = (description: string) => description.split('. ')[0] + '.'

export default function ShelterAddons() {
  const { data, isLoading, isError } = useShelterFeatures()

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (isError || !data) {
    return <p>Nie udało się pobrać listy dodatków.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-8 px-8 md:px-0 md:grid-cols-2">
      {data.map((feature) => {
        const Icon = ADDON_REGISTRY[feature.key]?.icon ?? PuzzleIcon

        return (
          <Link
            key={feature.key}
            to="/addons/$addonKey"
            params={{ addonKey: feature.key }}
            className="group"
          >
            <Card className="h-full transition-colors group-hover:border-emerald-600">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Icon className="size-6 text-emerald-600" />
                  <CardTitle>{feature.name}</CardTitle>
                </div>
                <Badge
                  className={cn(
                    feature.isEnabled
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {feature.isEnabled ? 'Włączony' : 'Wyłączony'}
                </Badge>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-between gap-4">
                <p className="text-muted-foreground">
                  {getSummary(feature.description)}
                </p>
                <span className="flex items-center gap-2 font-medium text-emerald-700">
                  Zobacz szczegóły
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
