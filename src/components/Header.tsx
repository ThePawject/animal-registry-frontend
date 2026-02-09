import { Link } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from './ui/button'
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
      <header className="p-4 flex items-center bg-emerald-800 text-white shadow-md">
        <div className="max-w-[1440px] mx-auto flex items-center w-full">
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/" className="flex gap-2 items-center">
              <img
                src="./animal-shelter-logo.png"
                alt="Schronisko dla zwierząt"
                className="h-10"
              />
              {shelterName ? `Panel ${shelterName}` : 'Panel Schroniska'}
            </Link>
          </h1>
          <div className="ml-auto space-x-4 flex items-center justify-center min-w-[100px]">
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
              <Button
                variant="secondary"
                onClick={() => {
                  logout({
                    logoutParams: { returnTo: getOriginHomePage() || '' },
                  })
                }}
              >
                Wyloguj się
              </Button>
            ) : (
              <Button
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
      </header>
    </>
  )
}
