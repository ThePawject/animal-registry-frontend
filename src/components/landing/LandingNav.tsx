import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { LogIn, Menu, X } from 'lucide-react'
import { NAV_LINKS } from './constants'
import { Button } from '@/components/ui/button'
import { getAuthorizationParams } from '@/lib/utils'

export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { loginWithRedirect, isLoading } = useAuth0()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <a href="#gora" className="shrink-0" aria-label="MojeSchronisko.pl">
          <img
            src="/animal-shelter-logo.png"
            alt=""
            width={40}
            height={40}
            className="size-9 object-contain sm:size-10"
          />
        </a>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-emerald-800"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() =>
              loginWithRedirect({
                authorizationParams: getAuthorizationParams(),
              })
            }
            className="border-emerald-700 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
          >
            <LogIn />
            Zaloguj się
          </Button>
          <Button
            asChild
            className="bg-emerald-800 text-white hover:bg-emerald-900"
          >
            <a href="#kontakt">
              <span className="sm:hidden">Kontakt</span>
              <span className="hidden sm:inline">Skontaktuj się</span>
            </a>
          </Button>
        </div>
      </nav>

      {isMenuOpen && (
        <ul className="border-t border-slate-200 bg-white px-6 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-sm font-medium text-slate-700"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
