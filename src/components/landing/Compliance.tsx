import {
  CalendarRange,
  Database,
  Download,
  ExternalLink,
  FileText,
  ListChecks,
  Scale,
} from 'lucide-react'
import { REGULATION_URL, REPORT_PREVIEW, SAMPLE_REPORT_URL } from './constants'
import { Button } from '@/components/ui/button'

const REPORTS = [
  {
    icon: Database,
    title: 'Zrzut repozytorium zwierząt',
    description: 'Pełna ewidencja z danymi każdego zwierzęcia.',
  },
  {
    icon: ListChecks,
    title: 'Raport zdarzeń',
    description: 'Wszystkie zdarzenia z datami i autorami wpisów.',
  },
  {
    icon: FileText,
    title: 'Raport z wybranych zwierząt',
    description: 'Tylko te pozycje, o które pyta kontrola.',
  },
  {
    icon: CalendarRange,
    title: 'Raport zdarzeń z zakresu dat',
    description: 'Na przykład za wskazany rok albo kwartał.',
  },
]

export function Compliance() {
  return (
    <section id="zgodnosc" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
            <Scale className="size-3.5" />
            Zgodność z przepisami
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Przygotowane pod audyt państwowy
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Aplikacja implementuje to, co jest faktycznie potrzebne do przejścia
            audytu państwowego: zakres danych ewidencyjnych, rejestr zdarzeń i
            raporty zgodne z wymogami określonymi w rozporządzeniu (Dz.U. 2022
            poz. 175). Rejestr rozwijamy dalej i dostosowujemy do nowych wymogów
            prawnych.
          </p>
          <a
            href={REGULATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
          >
            Treść rozporządzenia (PDF, isap.sejm.gov.pl)
            <ExternalLink className="size-4" />
          </a>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REPORTS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 font-semibold text-slate-900">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Zobacz przykładowy raport
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Plik wygenerowany przez aplikację na danych demonstracyjnych,
                dokładnie w takiej formie trafia do kontroli.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button asChild variant="outline" className="border-slate-300">
                <a
                  href={SAMPLE_REPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                  Otwórz w nowej karcie
                </a>
              </Button>
              <Button
                asChild
                className="bg-emerald-800 text-white hover:bg-emerald-900"
              >
                <a href={SAMPLE_REPORT_URL} download>
                  <Download />
                  Pobierz PDF
                </a>
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-10 sm:px-8">
            <a
              href={SAMPLE_REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mx-auto block w-full max-w-[30rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-900/10 transition-shadow hover:shadow-xl"
            >
              <span className="block max-h-[24rem] overflow-hidden">
                <img
                  src={REPORT_PREVIEW}
                  alt="Strona przykładowego raportu zdarzeń wygenerowanego przez aplikację"
                  width={1200}
                  height={1698}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-slate-900/80 py-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="size-4" />
                Otwórz pełny raport
              </span>
            </a>
            <p className="mt-6 text-center text-sm text-slate-500">
              Raport w formacie A4, z nagłówkiem schroniska i stopką zawierającą
              datę wygenerowania.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
