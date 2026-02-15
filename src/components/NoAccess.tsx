import { useAuth0 } from '@auth0/auth0-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

export function NoAccess() {
  const { isLoading, logout } = useAuth0()

  return (
    <Card className="p-8 w-100">
      <h2 className="text-2xl font-semibold mb-4 text-red-700 text-center">
        Nie masz przypisanej roli
      </h2>
      <p className="text-lg mb-4 text-gray-700 text-center">
        Twoje konto nie posiada jeszcze przypisanej roli. To typowa sytuacja
        zaraz po założeniu nowego konta. Musisz poczekać, aż administrator nada
        Ci odpowiednią rolę.
      </p>
      <p className="text-md mb-8 text-gray-600 text-center">
        Możesz spróbować zalogować się ponownie później, gdy uzyskasz dostęp.
      </p>
      <Button
        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        size="lg"
        onClick={() => {
          logout({ logoutParams: { returnTo: window.location.origin } })
        }}
        disabled={isLoading}
      >
        Przejdź do strony logowania
      </Button>
    </Card>
  )
}
