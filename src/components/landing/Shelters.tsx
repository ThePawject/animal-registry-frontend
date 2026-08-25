import { ArrowUpRight, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'

const SHELTERS = [
  {
    name: 'Schronisko Kundelek w Rzeszowie',
    location: 'ul. Ciepłownicza 3, Rzeszów',
    description:
      'Miejskie schronisko dla zwierząt bezdomnych, prowadzone przez Rzeszowskie Stowarzyszenie Ochrony Zwierząt od 2005 roku. Psy i koty mają tu całodobową opiekę, w tym weterynaryjną.',
    url: 'http://kundelek.rsoz.org/',
    urlLabel: 'kundelek.rsoz.org',
  },
  {
    name: 'Schronisko w Orzechowcach',
    location: 'Orzechowce 3, powiat przemyski',
    description:
      'Schronisko dla bezdomnych zwierząt prowadzone przez gminę miejską Przemyśl, położone wśród pól niedaleko Orzechowiec i Orłów.',
    url: 'http://www.schroniskoorzechowce.pl/',
    urlLabel: 'schroniskoorzechowce.pl',
  },
]

export function Shelters() {
  return (
    <section className="border-y border-slate-200 bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
            Kto już korzysta
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Dwa schroniska pracują na naszym rejestrze
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Oba prowadzą w nim ewidencję od momentu, w którym eRejestr stał się
            obowiązkiem. Ich uwagi z codziennej pracy wyznaczają kolejność
            naszych prac.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SHELTERS.map((shelter) => (
            <Card
              key={shelter.name}
              className="gap-4 border-slate-200 p-7 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {shelter.name}
              </h3>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="size-4 shrink-0 text-emerald-700" />
                {shelter.location}
              </p>
              <p className="text-[15px] leading-relaxed text-slate-600">
                {shelter.description}
              </p>
              <a
                href={shelter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
              >
                {shelter.urlLabel}
                <ArrowUpRight className="size-4" />
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
