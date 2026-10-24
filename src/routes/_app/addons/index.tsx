import { createFileRoute } from '@tanstack/react-router'
import ShelterAddons from '@/components/ShelterAddons'

export const Route = createFileRoute('/_app/addons/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ShelterAddons />
}
