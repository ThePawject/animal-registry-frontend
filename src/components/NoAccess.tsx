import { useAuth0 } from '@auth0/auth0-react'
import { Button } from './ui/button'

export function NoAccess() {
  const { isLoading, logout } = useAuth0()

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
            <h2 className="text-2xl font-semibold mb-4 text-red-700">
              Nie masz przypisanej roli
            </h2>
            <p className="text-lg mb-4 text-gray-700 text-center">
              Twoje konto nie posiada jeszcze przypisanej roli. To typowa
              sytuacja zaraz po założeniu nowego konta. Musisz poczekać, aż
              administrator nada Ci odpowiednią rolę.
            </p>
            <p className="text-md mb-8 text-gray-600 text-center">
              Możesz spróbować zalogować się ponownie później, gdy uzyskasz
              dostęp.
            </p>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              onClick={() => {
                logout()
              }}
              disabled={isLoading}
            >
              Przejdź do strony logowania
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
