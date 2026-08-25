import { Link } from '@tanstack/react-router'
import { ExternalLink, Mail } from 'lucide-react'
import { CONTACT_EMAIL, REGULATION_URL } from './constants'

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/animal-shelter-logo.png"
                alt=""
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                MojeSchronisko<span className="text-emerald-700">.pl</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Elektroniczny rejestr zwierząt dla schronisk, tworzony
              charytatywnie i udostępniany bezpłatnie. Rozwijamy go dalej razem
              ze schroniskami, które z niego korzystają.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Kontakt</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-emerald-800"
                >
                  <Mail className="size-4 shrink-0 text-emerald-700" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href="#kontakt"
                  className="text-slate-600 transition-colors hover:text-emerald-800"
                >
                  Formularz zapytania
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Przydatne linki
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <Link
                  to="/panel"
                  className="text-slate-600 transition-colors hover:text-emerald-800"
                >
                  Panel schroniska
                </Link>
              </li>
              <li>
                <a
                  href="#funkcje"
                  className="text-slate-600 transition-colors hover:text-emerald-800"
                >
                  Funkcje rejestru
                </a>
              </li>
              <li>
                <a
                  href={REGULATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-emerald-800"
                >
                  Rozporządzenie (PDF)
                  <ExternalLink className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Projekt non-profit, tworzony charytatywnie dla schronisk.</p>
          <p>&copy; {new Date().getFullYear()} MojeSchronisko.pl</p>
        </div>
      </div>
    </footer>
  )
}
