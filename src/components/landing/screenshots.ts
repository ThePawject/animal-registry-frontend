export type Screenshot = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
  thumbPosition?: string
}

export const SCREENSHOTS = {
  animalList: {
    src: '/landing/lista-zwierzat.webp',
    alt: 'Lista zwierząt w panelu schroniska z wyszukiwaniem, filtrami i statusami',
    caption: 'Lista zwierząt z wyszukiwaniem, filtrami i statusami',
    width: 1600,
    height: 882,
  },
  animalCard: {
    src: '/landing/karta-zwierzecia.webp',
    alt: 'Karta zwierzęcia z danymi podstawowymi, statusem i galerią zdjęć',
    caption: 'Karta zwierzęcia razem z galerią zdjęć',
    width: 1600,
    height: 881,
  },
  events: {
    src: '/landing/historia-zdarzen.webp',
    alt: 'Historia zdarzeń zwierzęcia z typem zdarzenia, datą, opisem i autorem wpisu',
    caption: 'Historia zdarzeń z datą, opisem i autorem wpisu',
    width: 1600,
    height: 883,
  },
  healthRecords: {
    src: '/landing/karty-zdrowia.webp',
    alt: 'Karty zdrowia zwierzęcia z dokumentami medycznymi w formacie PDF',
    caption: 'Karty zdrowia z dokumentami od weterynarza',
    width: 1600,
    height: 404,
  },
  report: {
    src: '/landing/raport-pdf.webp',
    alt: 'Wygenerowany raport PDF ze zrzutem repozytorium zwierząt',
    caption: 'Raport PDF gotowy do przekazania kontroli',
    width: 1600,
    height: 800,
    thumbPosition: 'object-center',
  },
  login: {
    src: '/landing/ekran-logowania.webp',
    alt: 'Ekran logowania do panelu schroniska w MojeSchronisko.pl',
    caption: 'Osobne konto dla każdego pracownika schroniska',
    width: 1600,
    height: 800,
    thumbPosition: 'object-center',
  },
} satisfies Record<string, Screenshot>

export const GALLERY: Array<Screenshot> = [
  SCREENSHOTS.animalList,
  SCREENSHOTS.animalCard,
  SCREENSHOTS.events,
  SCREENSHOTS.report,
  SCREENSHOTS.healthRecords,
  SCREENSHOTS.login,
]
