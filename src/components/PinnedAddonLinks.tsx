import { Link } from '@tanstack/react-router'
import { NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu'
import { ADDON_REGISTRY } from '@/api/features/registry'
import { useShelterFeatures } from '@/api/features/queries'
import { navLinkClassName } from '@/lib/navigation'

export default function PinnedAddonLinks() {
  const { data } = useShelterFeatures()

  return data
    ?.filter((feature) => feature.isEnabled)
    .map((feature) => ({
      key: feature.key,
      icon: ADDON_REGISTRY[feature.key]?.icon,
      pinned: ADDON_REGISTRY[feature.key]?.pinned,
    }))
    .filter((addon) => addon.pinned)
    .map(({ key, icon: Icon, pinned }) => (
      <NavigationMenuItem key={key}>
        <NavigationMenuLink asChild className={navLinkClassName}>
          <Link to={pinned!.to}>
            {Icon && <Icon />}
            {pinned!.label}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    ))
}
