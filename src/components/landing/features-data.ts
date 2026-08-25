import {
  ClipboardList,
  FileText,
  History,
  Images,
  Stethoscope,
  Users,
} from 'lucide-react'
import { SCREENSHOTS } from './screenshots'
import type { Screenshot } from './screenshots'

export type Feature = {
  icon: React.ElementType
  title: string
  description: string
  screenshot: Screenshot
}

export const FEATURES: Array<Feature> = [
  {
    icon: ClipboardList,
    title: 'Rejestr zwierząt',
    description:
      'Pełna ewidencja z wyszukiwaniem po imieniu i sygnaturze oraz filtrami po gatunku i statusie. Od razu widać, które zwierzęta są w schronisku, a które poza nim.',
    screenshot: SCREENSHOTS.animalList,
  },
  {
    icon: Images,
    title: 'Karta zwierzęcia z galerią',
    description:
      'Wszystkie dane na jednym ekranie: gatunek, płeć, rasa, umaszczenie, znaki szczególne, sygnatura i zdjęcia. Przydaje się i przy identyfikacji, i przy szukaniu domu.',
    screenshot: SCREENSHOTS.animalCard,
  },
  {
    icon: History,
    title: 'Historia zdarzeń',
    description:
      'Przyjęcia, adopcje, szczepienia, odrobaczenia, kwarantanna, zmiany kojca. Każdy wpis ma datę, opis i informację o tym, kto go wprowadził.',
    screenshot: SCREENSHOTS.events,
  },
  {
    icon: FileText,
    title: 'Raporty PDF',
    description:
      'Zrzut całego repozytorium, raport zdarzeń, raport z wybranych zwierząt oraz raport zdarzeń z zakresu dat. Wszystkie generowane jednym kliknięciem.',
    screenshot: SCREENSHOTS.report,
  },
  {
    icon: Stethoscope,
    title: 'Karty zdrowia i dokumenty',
    description:
      'Wyniki badań, zabiegi i dokumenty od weterynarza podpięte jako pliki PDF do konkretnego zwierzęcia, bez szukania po segregatorach.',
    screenshot: SCREENSHOTS.healthRecords,
  },
  {
    icon: Users,
    title: 'Konta dla pracowników',
    description:
      'Każdy pracownik loguje się na własne konto, a wpisy i zdarzenia zostają podpisane autorem. Zawsze wiadomo, kto i kiedy wprowadził dane.',
    screenshot: SCREENSHOTS.login,
  },
]
