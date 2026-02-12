import { useAuth0 } from '@auth0/auth0-react'
import { Button } from './ui/button'
import { getAuthorizationParams } from '@/lib/utils'

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0()

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-100 w-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <img
          src="./animal-shelter-logo.png"
          alt="Elektroniczny Rejestr Zwierząt"
          className="w-60 h-60 mb-2"
        />
        <div className="flex items-center justify-center w-full">
          <div className="max-w-md w-full p-8 bg-white rounded-md shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-800">
              Witaj w Panelu Elektronicznego Rejestru Zwierząt!
            </h2>
            <p className="text-lg mb-8 text-emerald-700">
              Zaloguj się, aby otrzymać dostęp do elektronicznego rejestru
              zwierząt.
            </p>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: getAuthorizationParams(),
                })
              }
              disabled={isLoading}
            >
              Zaloguj się
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
