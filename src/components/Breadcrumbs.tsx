import { Link, useMatches } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'

export const Breadcrumbs = () => {
  const matches = useMatches()

  const breadcrumbItems = matches
    .filter((match) => match.loaderData?.title)
    .map(({ pathname, loaderData }) => ({
      href: pathname,
      label: loaderData?.title,
    }))

  if (breadcrumbItems.length < 2) {
    return null
  }
  return (
    <Breadcrumb className="px-8 md:px-0">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          return (
            <>
              <BreadcrumbItem key={item.href}>
                {isLast ? (
                  <BreadcrumbPage className="text-lg">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild href={item.href} className="text-lg">
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator className="text-lg" />
              )}
            </>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
