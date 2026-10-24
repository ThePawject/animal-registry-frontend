import { Link } from '@tanstack/react-router'

interface DisabledAddonProps {
  name: string
  addonKey: string
}

export default function DisabledAddon({ name, addonKey }: DisabledAddonProps) {
  return (
    <p>
      Dodatek „{name}" nie jest włączony.{' '}
      <Link
        to="/addons/$addonKey"
        params={{ addonKey }}
        className="text-emerald-700 hover:underline"
      >
        Zobacz, jak go włączyć
      </Link>
    </p>
  )
}
