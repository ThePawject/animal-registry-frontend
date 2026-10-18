import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/addons')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Dodatki', href: '/addons' }
  },
})

function RouteComponent() {
  return <Outlet />
}
