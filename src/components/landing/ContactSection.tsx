import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Mail } from 'lucide-react'
import { Reveal } from './Reveal'
import { CONTACT_EMAIL, buildContactMailto } from './constants'
import { Button } from '@/components/ui/button'

export function ContactSection() {
  const [isCopied, setIsCopied] = useState(false)
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
    } catch {
      return
    }
    setIsCopied(true)
    if (resetTimeout.current) clearTimeout(resetTimeout.current)
    resetTimeout.current = setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <section
      id="kontakt"
      className="scroll-mt-20 bg-emerald-800 py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Porozmawiajmy o Waszym schronisku
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-emerald-50">
            Napiszcie do nas kilka słów o sobie, a odpowiemy i przygotujemy dla
            Was środowisko demonstracyjne z przykładowymi danymi, żebyście mogli
            sami sprawdzić aplikację.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-center gap-6 rounded-2xl bg-white p-7 text-center shadow-xl md:p-10">
          <Mail className="size-10 text-emerald-700" />

          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-slate-500">
              Napiszcie na adres
            </p>
            <a
              href={buildContactMailto()}
              className="text-xl font-semibold break-all text-emerald-800 underline-offset-4 hover:underline md:text-2xl"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={handleCopy}
            aria-label={`Skopiuj adres e-mail ${CONTACT_EMAIL}`}
            className="bg-emerald-800 text-base text-white hover:bg-emerald-900"
          >
            {isCopied ? <Check /> : <Copy />}
            {isCopied ? 'Skopiowano' : 'Skopiuj adres e-mail'}
          </Button>

          <p aria-live="polite" className="sr-only">
            {isCopied ? 'Adres e-mail skopiowany do schowka' : ''}
          </p>

          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            Podajcie nazwę schroniska i osobę kontaktową, a odezwiemy się na ten
            sam adres.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
