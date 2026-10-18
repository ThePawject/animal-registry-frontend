import { Building2Icon, SyringeIcon } from 'lucide-react'
import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

type PinnedLink = {
  to: LinkProps['to']
  label: string
}

type AddonDefinition = {
  icon: LucideIcon
  title: string
  pinned?: PinnedLink
}

export const ADDON_REGISTRY: Partial<Record<string, AddonDefinition>> = {
  'animal-origin': {
    icon: Building2Icon,
    title: 'Pochodzenie zwierzęcia',
  },
  'animal-vaccinations': {
    icon: SyringeIcon,
    title: 'Szczepienia',
    pinned: { to: '/vaccinations', label: 'Szczepienia' },
  },
}
