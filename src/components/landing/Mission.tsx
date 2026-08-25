import { ArrowRight, Check, HandHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NO_CATCH = [
  {
    title: 'Bez abonamentu i opłat za korzystanie',
    description:
      'Nie ma cennika, wersji próbnej ani płatnego pakietu z dodatkami. Cała aplikacja jest dostępna od pierwszego dnia.',
  },
  {
    title: 'Bez opłat za konta dla pracowników',
    description:
      'Każda osoba w schronisku może dostać własne konto, niezależnie od tego, ile ich potrzebujecie.',
  },
  {
    title: 'Środowisko demonstracyjne przed decyzją',
    description:
      'Przygotujemy dla Was wersję z przykładowymi danymi, żebyście mogli sprawdzić aplikację bez ryzyka.',
  },
  {
    title: 'Kolejne wymogi prawne również bez opłat',
    description:
      'Gdy przepisy się zmienią, dostosujemy rejestr i nie wystawimy za to faktury.',
  },
]

export function Mission() {
  return (
    <section
      id="bezplatnosc"
      className="scroll-mt-20 border-y border-emerald-100 bg-emerald-50/70 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
            <HandHeart className="size-7" />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Nasza misja: 0 zł dla schronisk
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            MojeSchronisko.pl powstaje charytatywnie, jako projekt non-profit.
            Uważamy, że obowiązek prowadzenia elektronicznej ewidencji nie
            powinien oznaczać kolejnego kosztu w budżecie schroniska. Dlatego
            rejestr jest i pozostanie bezpłatny.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-emerald-800 text-base text-white hover:bg-emerald-900"
          >
            <a href="#kontakt">
              Skontaktuj się
              <ArrowRight />
            </a>
          </Button>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm md:p-9">
          <h3 className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
            Co to znaczy w praktyce
          </h3>
          <ul className="mt-6 flex flex-col gap-6">
            {NO_CATCH.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
