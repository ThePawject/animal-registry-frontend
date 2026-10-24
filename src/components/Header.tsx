import { Link } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import {
  BookOpenIcon,
  FileTextIcon,
  LogOutIcon,
  PawPrintIcon,
  PuzzleIcon,
} from 'lucide-react'
import PinnedAddonLinks from './PinnedAddonLinks'
import { Button } from './ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from './ui/navigation-menu'
import { navLinkClassName } from '@/lib/navigation'
import { getAuthorizationParams, getOriginHomePage } from '@/lib/utils'

type HeaderProps = {
  shelterName: string | null
}
export default function Header({ shelterName }: HeaderProps) {
  const { logout, isLoading, error, isAuthenticated, loginWithRedirect } =
    useAuth0()

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <>
      <header className="shrink-0">
        <div className="bg-emerald-800 text-white">
          <div className="container mx-auto flex items-center gap-4 px-4 py-2 w-full">
            <h1 className="min-w-0 text-base sm:text-lg font-semibold">
              <Link to="/panel" className="flex gap-2 items-center min-w-0">
                <img
                  src="/animal-shelter-logo.webp"
                  alt="Elektroniczny Rejestr Zwierząt"
                  className="h-8 shrink-0"
                />
                <span className="truncate">
                  {shelterName
                    ? `Panel ${shelterName}`
                    : 'Elektroniczny Rejestr Zwierząt'}
                </span>
              </Link>
            </h1>
            <div className="ml-auto flex shrink-0 items-center justify-center gap-2 sm:gap-4 min-w-[40px]">
              {isLoading ? (
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C4.477 0 0 4.477 0 12h4z"
                  />
                </svg>
              ) : isAuthenticated ? (
                <>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="hover:bg-emerald-700 hover:text-white"
                  >
                    <Link to="/guide">
                      <BookOpenIcon />
                      <span className="sr-only sm:not-sr-only">Przewodnik</span>
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label="Wyloguj się"
                    onClick={() => {
                      logout({
                        logoutParams: { returnTo: getOriginHomePage() || '' },
                      })
                    }}
                  >
                    <LogOutIcon className="sm:hidden" />
                    <span className="hidden sm:inline">Wyloguj się</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() =>
                    loginWithRedirect({
                      authorizationParams: getAuthorizationParams(),
                    })
                  }
                >
                  Zaloguj się
                </Button>
              )}
            </div>
          </div>
        </div>
        {isAuthenticated && (
          <div className="border-b bg-white">
            <nav aria-label="Nawigacja główna" className="container mx-auto">
              <NavigationMenu
                viewport={false}
                className="max-w-full justify-start overflow-x-auto px-2 sm:px-4"
              >
                <NavigationMenuList className="flex-none justify-start gap-2 py-1.5">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navLinkClassName}>
                      <Link to="/panel">
                        <PawPrintIcon />
                        Zwierzęta
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <PinnedAddonLinks />
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navLinkClassName}>
                      <Link to="/reports">
                        <FileTextIcon />
                        Raporty
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navLinkClassName}>
                      <Link to="/addons">
                        <PuzzleIcon />
                        Dodatki
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
