import { ExternalLink, Scale } from 'lucide-react'
import { REGULATION_URL } from './constants'
import { ReportCarousel } from './ReportCarousel'

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

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
              Sześć raportów, które generuje aplikacja
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Wszystkie pliki poniżej wyszły z działającej aplikacji na danych
              demonstracyjnych. Dokładnie w takiej formie trafiają do kontroli.
              Możesz je otworzyć w nowej karcie albo pobrać.
            </p>
          </div>

          <div className="mt-10">
            <ReportCarousel />
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Raporty w formacie A4, z nagłówkiem schroniska i stopką zawierającą
            datę wygenerowania.
          </p>
        </div>
      </div>
    </section>
  )
}
