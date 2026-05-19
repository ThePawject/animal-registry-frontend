import type { AnimalData } from './handlers/animal.handler'
import type { EventData } from './handlers/event.handler'
import type { HealthRecordData } from './handlers/health-record.handler'

export const ANIMALS: Record<string, AnimalData> = {
  createMinimum: { species: 'Pies' },
  createFull: {
    name: 'Burek E2E',
    species: 'Pies',
    sex: 'Samiec',
    breed: 'Mieszaniec',
    color: 'Brązowy',
    distinguishingMarks: 'Biała łapa',
    birthDate: '2022-03-15',
  },
  createList: { name: 'Filemon E2E', species: 'Kot', sex: 'Samiec' },
  deleteConfirm: { name: 'DoUsunięcia E2E', species: 'Pies' },
  deleteCancel: { name: 'NieUsuwaj E2E', species: 'Pies' },
  editNameBreed: { name: 'DoEdycji E2E', species: 'Pies' },
  editSpeciesSex: { name: 'ZmienGatunek E2E', species: 'Pies', sex: 'Samiec' },
  viewAllData: {
    name: 'PodgladTest E2E',
    species: 'Kot',
    sex: 'Samica',
    breed: 'Perski',
    color: 'Biały',
    distinguishingMarks: 'Czarny nos',
    birthDate: '2021-06-10',
  },
  viewTabs: { name: 'TabyTest E2E', species: 'Pies' },
  eventAdd: { name: 'EventTest E2E', species: 'Pies' },
  eventEdit: { name: 'EditEventTest E2E', species: 'Kot' },
  eventDelete: { name: 'DelEventTest E2E', species: 'Pies' },
  medRecordAdd: { name: 'MedTest E2E', species: 'Pies' },
  medRecordEdit: { name: 'EditMedTest E2E', species: 'Kot' },
  medRecordDelete: { name: 'DelMedTest E2E', species: 'Pies' },
  photoUpload: { name: 'PhotoTest E2E', species: 'Pies' },
  photoEdit: { name: 'EditPhotoTest E2E', species: 'Kot' },
}

export const EVENTS: Record<string, EventData & { editedDescription?: string }> = {
  add: { type: 'Spacer', date: '2024-05-01', description: 'Spacer testowy E2E' },
  edit: { type: 'Odrobaczenie', date: '2024-04-10', description: 'Pierwotny opis E2E', editedDescription: 'Zaktualizowany opis E2E' },
  delete: { type: 'Szczepienie przeciw wściekliźnie', date: '2024-03-20', description: 'Szczepienie do usunięcia E2E' },
}

export const HEALTH_RECORDS: Record<string, HealthRecordData & { editedDescription?: string }> = {
  add: { date: '2024-05-15', description: 'Wizyta kontrolna E2E' },
  edit: { date: '2024-04-20', description: 'Pierwotna karta E2E', editedDescription: 'Zaktualizowana karta E2E' },
  delete: { date: '2024-03-10', description: 'Karta do usunięcia E2E' },
}

export const EDIT_RESULTS = {
  nameBreed: { name: 'ZEdytowany E2E', breed: 'Labrador' },
  speciesSex: { species: 'Kot', sex: 'Samica' },
}
