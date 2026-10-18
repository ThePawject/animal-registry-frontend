import { createFileRoute } from '@tanstack/react-router'
import AddonPage from '@/components/AddonPage'
import { ADDON_REGISTRY } from '@/api/features/registry'

export const Route = createFileRoute('/_app/addons/$addonKey')({
  component: RouteComponent,
  loader: ({ params }) => {
    return { title: ADDON_REGISTRY[params.addonKey]?.title ?? 'Dodatek' }
  },
})

function RouteComponent() {
  const { addonKey } = Route.useParams()
  return <AddonPage addonKey={addonKey} />
}
