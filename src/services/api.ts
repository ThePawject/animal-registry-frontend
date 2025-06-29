import { Animal, AnimalEvent, MedicalRecord, User, FilterType, ApiResponse } from '../types';

// Mock data
const mockAnimals: Animal[] = [
  {
    id: '1',
    signature: 'PS001',
    name: 'Burek',
    chipNumber: '982000123456789',
    color: 'brązowy',
    birthDate: '2020-03-15',
    species: 'pies',
    gender: 'on',
    isInShelter: true,
    photos: [
      'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg',
      'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg'
    ],
    events: [
      {
        id: '1',
        type: 'Przyjęcie do schroniska',
        performedBy: 'Anna Kowalska',
        note: 'Znaleziony na ulicy, w dobrym stanie',
        date: '2023-01-15'
      }
    ],
    medicalRecords: [
      {
        id: '1',
        note: 'Szczepienie przeciw wściekliźnie',
        date: '2023-01-20'
      }
    ]
  },
  {
    id: '2',
    signature: 'KT002',
    name: 'Mruczek',
    chipNumber: '982000123456790',
    color: 'czarny',
    birthDate: '2021-07-22',
    species: 'kot',
    gender: 'on',
    isInShelter: true,
    photos: [
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
    ],
    events: [
      {
        id: '2',
        type: 'Przyjęcie do schroniska',
        performedBy: 'Jan Nowak',
        note: 'Przekazany przez właściciela',
        date: '2023-02-10'
      }
    ],
    medicalRecords: [
      {
        id: '2',
        note: 'Badanie ogólne - stan dobry',
        date: '2023-02-11'
      }
    ]
  },
  {
    id: '3',
    signature: 'PS003',
    name: 'Łajka',
    chipNumber: '982000123456791',
    color: 'biały',
    birthDate: '2019-11-08',
    species: 'pies',
    gender: 'ona',
    isInShelter: false,
    photos: [
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'
    ],
    events: [
      {
        id: '3',
        type: 'Adopcja',
        performedBy: 'Maria Wiśniewska',
        note: 'Adoptowana przez rodzinę z dziećmi',
        date: '2023-03-05'
      }
    ],
    medicalRecords: []
  }
];

const mockUser: User = {
  id: '1',
  username: 'admin',
  name: 'Administrator Schroniska'
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1000);
    
    if (username === 'admin' && password === 'admin') {
      return {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token'
        }
      };
    }
    
    return {
      success: false,
      data: null,
      message: 'Nieprawidłowy login lub hasło'
    };
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(500);
    return mockUser;
  }
};

export const animalService = {
  async getAnimals(filter: FilterType, search: string = ''): Promise<ApiResponse<Animal[]>> {
    await delay(800);
    
    let filtered = mockAnimals;
    
    // Apply filter
    switch (filter) {
      case 'psy-w-schronisku':
        filtered = filtered.filter(a => a.species === 'pies' && a.isInShelter);
        break;
      case 'koty-w-schronisku':
        filtered = filtered.filter(a => a.species === 'kot' && a.isInShelter);
        break;
      case 'psy-poza-schroniskiem':
        filtered = filtered.filter(a => a.species === 'pies' && !a.isInShelter);
        break;
      case 'koty-poza-schroniskiem':
        filtered = filtered.filter(a => a.species === 'kot' && !a.isInShelter);
        break;
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.signature.toLowerCase().includes(searchLower) ||
        a.chipNumber.includes(searchLower) ||
        a.color.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      success: true,
      data: filtered
    };
  },

  async getAnimal(id: string): Promise<ApiResponse<Animal>> {
    await delay(500);
    const animal = mockAnimals.find(a => a.id === id);
    
    if (animal) {
      return {
        success: true,
        data: animal
      };
    }
    
    return {
      success: false,
      data: null,
      message: 'Zwierzę nie zostało znalezione'
    };
  },

  async addEvent(animalId: string, event: Omit<AnimalEvent, 'id'>): Promise<ApiResponse<AnimalEvent>> {
    await delay(800);
    
    const newEvent: AnimalEvent = {
      ...event,
      id: Date.now().toString()
    };
    
    const animal = mockAnimals.find(a => a.id === animalId);
    if (animal) {
      animal.events.push(newEvent);
    }
    
    return {
      success: true,
      data: newEvent
    };
  },

  async addMedicalRecord(animalId: string, record: Omit<MedicalRecord, 'id'>): Promise<ApiResponse<MedicalRecord>> {
    await delay(800);
    
    const newRecord: MedicalRecord = {
      ...record,
      id: Date.now().toString()
    };
    
    const animal = mockAnimals.find(a => a.id === animalId);
    if (animal) {
      animal.medicalRecords.push(newRecord);
    }
    
    return {
      success: true,
      data: newRecord
    };
  },

  async generateReport(animalIds: string[]): Promise<ApiResponse<string>> {
    await delay(1500);
    
    return {
      success: true,
      data: `Raport wygenerowany dla ${animalIds.length} zwierząt`,
      message: 'Raport został pomyślnie wygenerowany'
    };
  }
};