export const CONTACT_EMAIL = 'kontakt@mojeschronisko.pl'

export const SAMPLE_REPORT_URL = '/landing/przykladowy-raport.pdf'

export const REPORT_PREVIEW = '/landing/przykladowy-raport-podglad.webp'

export const REGULATION_URL =
  'https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20220000175/O/D20220175.pdf'

export const SHELTERS_USING_APP = [
  'Schronisko Kundelek w Rzeszowie',
  'Schronisko w Orzechowcach',
] as const

export const NAV_LINKS = [
  { href: '#funkcje', label: 'Funkcje' },
  { href: '#zgodnosc', label: 'Zgodność z prawem' },
  { href: '#bezplatnosc', label: 'Bezpłatność' },
] as const

export const buildContactMailto = (body?: string) => {
  const params = new URLSearchParams({
    subject: 'Zapytanie o eRejestr MojeSchronisko.pl',
    body:
      body ??
      [
        'Nazwa schroniska:',
        'Osoba kontaktowa:',
        'Telefon:',
        '',
        'Wiadomość:',
        '',
      ].join('\n'),
  })
  return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`
}
