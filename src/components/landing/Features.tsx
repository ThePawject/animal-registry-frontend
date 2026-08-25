import { Check } from 'lucide-react'
import { FeatureCarousel } from './FeatureCarousel'

const BENEFITS = [
  'Dodanie zwierzęcia to jeden formularz, bez przeklikiwania się przez kilka ekranów.',
  'Aplikacja działa w przeglądarce, więc nie trzeba nic instalować na komputerach w schronisku.',
  'Interfejs jest po polsku, a nazwy pól odpowiadają tym z papierowej ewidencji.',
  'Obsługa nie wymaga szkoleń ani wiedzy technicznej.',
]

export function Features() {
  return (
    <section id="funkcje" className="scroll-mt-20 bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Wszystko, czego schronisko potrzebuje na co dzień
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Funkcje powstawały razem ze schroniskami, które z aplikacji
            korzystają. Poniżej zrzuty z działającego panelu.
          </p>
        </div>

        <div className="mt-14">
          <FeatureCarousel />
        </div>

        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 md:p-10">
          <h3 className="text-xl font-semibold text-slate-900">
            Przejrzysty interfejs, dane pod ręką
          </h3>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600">
            Zależało nam, żeby wprowadzenie zwierzęcia albo dopisanie
            szczepienia zajmowało chwilę i nie było kolejnym obowiązkiem na
            koniec dnia.
          </p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="text-[15px] leading-relaxed text-slate-700">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
