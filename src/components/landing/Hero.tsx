import { ArrowRight, BadgeCheck, HandHeart, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Gotowe na kontrolę',
    description:
      'Zakres danych i raporty zgodne z wymogami rozporządzenia z 2022 roku.',
  },
  {
    icon: HandHeart,
    title: 'Zawsze bezpłatnie',
    description:
      'Projekt non-profit, bez abonamentu, bez limitów i bez ukrytych opłat.',
  },
  {
    icon: BadgeCheck,
    title: 'Sprawdzone w praktyce',
    description:
      'Dwa schroniska prowadzą w nim swoją ewidencję na co dzień, od pierwszego dnia obowiązku.',
  },
]

export function Hero() {
  return (
    <section id="gora" className="relative overflow-hidden bg-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 size-[32rem] rounded-full bg-emerald-100/60 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-6xl">
            Cała ewidencja schroniska w jednym bezpłatnym rejestrze
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Karty zwierząt, historia zdarzeń, dokumentacja medyczna i raporty
            pod kontrolę, wszystko w jednej aplikacji. Tworzymy
            MojeSchronisko.pl charytatywnie i udostępniamy schroniskom
            całkowicie bezpłatnie.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-emerald-800 text-base text-white hover:bg-emerald-900 sm:w-auto"
            >
              <a href="#kontakt">
                Skontaktuj się
                <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-slate-300 text-base sm:w-auto"
            >
              <a href="#funkcje">Zobacz funkcje</a>
            </Button>
          </div>
        </div>

        <ul className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                <Icon className="size-7" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
