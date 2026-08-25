import { useForm } from '@tanstack/react-form'
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react'
import { CONTACT_EMAIL, buildContactMailto } from './constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useSendContactInquiry } from '@/api/contact/queries'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const defaultValues = {
  shelterName: '',
  contactPerson: '',
  email: '',
  phone: '',
  message: '',
  consent: false,
  _honey: '',
}

type FieldErrorProps = { error?: string }

function FieldError({ error }: FieldErrorProps) {
  if (!error) return null
  return <p className="text-sm font-medium text-red-600">{error}</p>
}

export function ContactSection() {
  const { mutateAsync, isPending, isError, isSuccess } = useSendContactInquiry()

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutateAsync(value)
    },
  })

  return (
    <section
      id="kontakt"
      className="scroll-mt-20 bg-emerald-800 py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Porozmawiajmy o Waszym schronisku
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-emerald-50">
            Napiszcie kilka słów o sobie, a odpowiemy i przygotujemy dla Was
            środowisko demonstracyjne z przykładowymi danymi, żebyście mogli
            sami sprawdzić aplikację.
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-7 shadow-xl md:p-10">
          {isSuccess ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="size-12 text-emerald-600" />
              <h3 className="text-xl font-semibold text-slate-900">
                Dziękujemy za wiadomość!
              </h3>
              <p className="max-w-md text-slate-600">
                Odezwiemy się na podany adres e-mail. Jeśli sprawa jest pilna,
                możesz też napisać wprost na {CONTACT_EMAIL}.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="flex flex-col gap-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field
                  name="shelterName"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length === 0
                        ? 'Podaj nazwę schroniska'
                        : undefined,
                  }}
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Nazwa schroniska *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Schronisko dla Zwierząt w..."
                        autoComplete="organization"
                      />
                      <FieldError
                        error={field.state.meta.errors.join(', ') || undefined}
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="contactPerson"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length === 0
                        ? 'Podaj osobę kontaktową'
                        : undefined,
                  }}
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Osoba kontaktowa *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Imię i nazwisko"
                        autoComplete="name"
                      />
                      <FieldError
                        error={field.state.meta.errors.join(', ') || undefined}
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => {
                      if (value.trim().length === 0) return 'Podaj adres e-mail'
                      return EMAIL_PATTERN.test(value.trim())
                        ? undefined
                        : 'Podaj poprawny adres e-mail'
                    },
                  }}
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>E-mail *</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="kontakt@schronisko.pl"
                        autoComplete="email"
                      />
                      <FieldError
                        error={field.state.meta.errors.join(', ') || undefined}
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="phone"
                  children={(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Telefon</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="opcjonalnie"
                        autoComplete="tel"
                      />
                    </div>
                  )}
                />
              </div>

              <form.Field
                name="message"
                children={(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Wiadomość</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Np. „Chcielibyśmy zobaczyć demo” albo „Mamy pytanie o przeniesienie danych z arkusza”."
                      rows={4}
                    />
                  </div>
                )}
              />

              <form.Field
                name="consent"
                validators={{
                  onChange: ({ value }) =>
                    value
                      ? undefined
                      : 'Zgoda jest niezbędna, aby odpowiedzieć',
                }}
                children={(field) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked === true)
                        }
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={field.name}
                        className="text-sm leading-relaxed font-normal text-slate-600"
                      >
                        Zgadzam się na kontakt w sprawie mojego zapytania i na
                        przetwarzanie podanych danych w tym celu. *
                      </Label>
                    </div>
                    <FieldError
                      error={field.state.meta.errors.join(', ') || undefined}
                    />
                  </div>
                )}
              />

              <form.Field
                name="_honey"
                children={(field) => (
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
                  />
                )}
              />

              {isError && (
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold">
                      Nie udało się wysłać wiadomości.
                    </p>
                    <p className="mt-1">
                      Napiszcie do nas bezpośrednio na adres{' '}
                      <a
                        href={buildContactMailto()}
                        className="font-semibold underline underline-offset-2"
                      >
                        {CONTACT_EMAIL}
                      </a>
                      , na pewno odpowiemy.
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="mt-1 bg-emerald-800 text-base text-white hover:bg-emerald-900"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <Send />
                    Wyślij zapytanie
                  </>
                )}
              </Button>

              <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Mail className="size-4" />
                Wolisz zwykłego maila?{' '}
                <a
                  href={buildContactMailto()}
                  className="font-medium text-emerald-800 underline-offset-2 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
