import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'

export default function Header() {
  return (
    <>
      <header className="p-4 flex items-center bg-emerald-800 text-white shadow-md">
        <div className="max-w-[1440px] mx-auto flex items-center w-full">
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/" className="flex gap-2 items-center">
              <img
                src="/animal-shelter-logo.png"
                alt="Schronisko dla zwierząt"
                className="h-10"
              />
              Schronisko dla zwierząt
            </Link>
          </h1>
          <div className="ml-auto space-x-4">
            <Button
              variant="secondary"
              className="cursor-pointer"
              onClick={() => alert('TODO :)')}
            >
              Wyloguj się
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
