import {
  CalendarRange,
  Database,
  Dog,
  FileText,
  ListChecks,
  SlidersHorizontal,
} from 'lucide-react'

export type SampleReport = {
  id: string
  icon: React.ElementType
  title: string
  description: string
  pages: number
  file: string
  preview: string
  previewWidth: number
  previewHeight: number
}

const path = (name: string) => `/landing/reports/${name}`

export const SAMPLE_REPORTS: Array<SampleReport> = [
  {
    id: 'pelny-rejestr',
    icon: Database,
    title: 'Zrzut repozytorium zwierząt',
    description:
      'Pełna ewidencja: dane każdego zwierzęcia razem z sygnaturą, kodem transpondera i całą historią zdarzeń.',
    pages: 33,
    file: path('raport-pelny-rejestr.pdf'),
    preview: path('raport-pelny-rejestr-podglad.png'),
    previewWidth: 1000,
    previewHeight: 1415,
  },
  {
    id: 'wybrane-zwierzeta',
    icon: FileText,
    title: 'Raport wybranych zwierząt',
    description:
      'Tylko te pozycje, o które pyta kontrola. Zakres danych identyczny jak w pełnym zrzucie, ale dla zaznaczonych zwierząt.',
    pages: 14,
    file: path('raport-wybrane-zwierzeta.pdf'),
    preview: path('raport-wybrane-zwierzeta-podglad.png'),
    previewWidth: 1000,
    previewHeight: 1415,
  },
  {
    id: 'zakres-dat',
    icon: CalendarRange,
    title: 'Raport zwierząt z zakresem dat',
    description:
      'Ewidencja zawężona do zdarzeń z wybranego okresu. Przy każdym zdarzeniu data, typ, opis i osoba, która wpis wprowadziła.',
    pages: 55,
    file: path('raport-zakres-dat-wszystkie.pdf'),
    preview: path('raport-zakres-dat-wszystkie-podglad.png'),
    previewWidth: 1000,
    previewHeight: 1415,
  },
  {
    id: 'zakres-dat-filtr',
    icon: SlidersHorizontal,
    title: 'Raport z zakresu dat z filtrem gatunku',
    description:
      'Ten sam raport zawężony filtrem, tutaj wyłącznie psy z ostatnich dwóch miesięcy. Filtry ustawione w panelu przenoszą się do pliku.',
    pages: 11,
    file: path('raport-zakres-dat-psy.pdf'),
    preview: path('raport-zakres-dat-psy-podglad.png'),
    previewWidth: 1000,
    previewHeight: 1415,
  },
  {
    id: 'zdarzenia-okresy',
    icon: ListChecks,
    title: 'Raport zdarzeń: tydzień, miesiąc, kwartał',
    description:
      'Zestawienie liczbowe zdarzeń w trzech okresach jednocześnie, rozbite na gatunki. Przydaje się do sprawozdań dla gminy.',
    pages: 5,
    file: path('raport-zdarzen-okresy.pdf'),
    preview: path('raport-zdarzen-okresy-podglad.png'),
    previewWidth: 1000,
    previewHeight: 1415,
  },
  {
    id: 'zdarzenia-wlasny-zakres',
    icon: Dog,
    title: 'Raport zdarzeń z własnego zakresu dat',
    description:
      'To samo zestawienie za dowolnie wskazany okres, na przykład od jednej kontroli do drugiej albo za konkretny miesiąc.',
    pages: 3,
    file: path('raport-zdarzen-wlasny-zakres.pdf'),
    preview: path('raport-zdarzen-wlasny-zakres-podglad.png'),
    previewWidth: 1000,
    previewHeight: 1415,
  },
]
