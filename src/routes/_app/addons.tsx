import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/addons')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Dodatki', href: '/addons', hideBreadcrumbs: true }
  },
})

function RouteComponent() {
  return <Outlet />
}
