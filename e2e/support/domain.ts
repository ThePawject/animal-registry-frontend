export const SPECIES = { dog: 1, cat: 2 } as const
export type SpeciesKey = keyof typeof SPECIES

export const SPECIES_LABEL: Record<SpeciesKey, string> = {
  dog: 'Pies',
  cat: 'Kot',
}

export const SEX = { unknown: 0, male: 1, female: 2 } as const
export type SexKey = keyof typeof SEX

export const SEX_LABEL: Record<SexKey, string> = {
  unknown: 'Brak',
  male: 'Samiec',
  female: 'Samica',
}

export const EVENT_TYPE = {
  admission: 1,
  quarantineStart: 2,
  quarantineEnd: 3,
  infectiousDiseaseVaccination: 4,
  deworming: 5,
  defleaing: 6,
  sterilization: 7,
  rabiesVaccination: 8,
  adoption: 9,
  walk: 10,
  newKennelNumber: 11,
  pickedUpByOwner: 12,
  weighing: 13,
  euthanasia: 14,
  death: 15,
  released: 16,
  condition: 17,
} as const
export type EventTypeKey = keyof typeof EVENT_TYPE

export const EVENT_TYPE_LABEL: Record<EventTypeKey, string> = {
  admission: 'Przyjęcie do schroniska',
  quarantineStart: 'Początek kwarantanny',
  quarantineEnd: 'Koniec kwarantanny',
  infectiousDiseaseVaccination: 'Szczepienie przeciw chorobom zakaźnym',
  deworming: 'Odrobaczenie',
  defleaing: 'Odpluskwienie',
  sterilization: 'Sterylizacja/Kastracja',
  rabiesVaccination: 'Szczepienie przeciw wściekliźnie',
  adoption: 'Adopcja',
  walk: 'Spacer',
  newKennelNumber: 'Nowy numer kojca',
  pickedUpByOwner: 'Odbiór przez właściciela',
  weighing: 'Ważenie',
  euthanasia: 'Eutanazja',
  death: 'Zgon',
  released: 'Wypuszczony do środowiska',
  condition: 'Kondycja',
}

export const SHELTER_STATUS_LABEL = {
  inShelter: 'W schronisku',
  outOfShelter: 'Poza schroniskiem',
} as const

export const EMPTY_VALUE = { table: '-', details: 'Brak' } as const

export const GENERIC_ERROR_MESSAGE =
  'Wystąpił nieoczekiwany błąd. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.'
