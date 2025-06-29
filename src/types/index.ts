export interface Animal {
  id: string;
  signature: string;
  name: string;
  chipNumber: string;
  color: string;
  birthDate: string;
  species: 'pies' | 'kot';
  gender: 'on' | 'ona';
  isInShelter: boolean;
  photos: string[];
  events: AnimalEvent[];
  medicalRecords: MedicalRecord[];
}

export interface AnimalEvent {
  id: string;
  type: string;
  performedBy: string;
  note: string;
  date: string;
}

export interface MedicalRecord {
  id: string;
  note: string;
  date: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
}

export type FilterType = 'psy-w-schronisku' | 'koty-w-schronisku' | 'psy-poza-schroniskiem' | 'koty-poza-schroniskiem';

export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
}