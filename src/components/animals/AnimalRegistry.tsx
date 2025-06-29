import {useState, useEffect} from 'react';
import {Animal, FilterType} from '../../types';
import {animalService} from '../../services/api';
import {AnimalFilters} from './AnimalFilters';
import {AnimalTable} from './AnimalTable';
import {AnimalDetail} from './AnimalDetail';
import {AddEventModal} from './AddEventModal';
import {Toast} from '../ui/Toast';

export function AnimalRegistry() {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('psy-w-schronisku');
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    const loadAnimals = async () => {
        setIsLoading(true);
        try {
            const response = await animalService.getAnimals(filter, searchTerm);
            if (response.success) {
                if (response.data) {
                    setAnimals(response.data);
                } else {
                    setAnimals([])
                }
            }
        } catch (error) {
            console.error('Error loading animals:', error);
            setToast({
                message: 'Błąd podczas ładowania danych zwierząt',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnimals().then(x => console.log(x));
    }, [filter, searchTerm]);

    const handleAnimalClick = (animal: Animal) => {
        setSelectedAnimal(animal);
    };

    const handleGenerateReport = async (animalIds: string[]) => {
        try {
            const response = await animalService.generateReport(animalIds);
            if (response.success) {
                setToast({
                    message: response.message || 'Raport został wygenerowany pomyślnie',
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            setToast({
                message: 'Błąd podczas generowania raportu',
                type: 'error'
            });
        }
    };

    const handleAddEvent = (animalIds: string[]) => {
        setSelectedAnimalIds(animalIds);
        setIsEventModalOpen(true);
    };

    const handleEventSubmit = async (eventData: {
        type: string;
        performedBy: string;
        note: string;
        date: string;
    }) => {
        try {
            // Add event to all selected animals
            await Promise.all(
                selectedAnimalIds.map(animalId =>
                    animalService.addEvent(animalId, eventData)
                )
            );

            setToast({
                message: `Zdarzenie zostało dodane do ${selectedAnimalIds.length} zwierząt`,
                type: 'success'
            });

            // Refresh the animals list
            loadAnimals();
        } catch (error) {
            console.error('Error adding event:', error);
            setToast({
                message: 'Błąd podczas dodawania zdarzenia',
                type: 'error'
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Rejestr zwierząt
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Zarządzaj informacjami o zwierzętach w schronisku
                </p>
            </div>

            <AnimalFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filter={filter}
                onFilterChange={setFilter}
            />

            <AnimalTable
                animals={animals}
                isLoading={isLoading}
                onAnimalClick={handleAnimalClick}
                onGenerateReport={handleGenerateReport}
                onAddEvent={handleAddEvent}
            />

            {selectedAnimal && (
                <AnimalDetail
                    animal={selectedAnimal}
                    onClose={() => setSelectedAnimal(null)}
                />
            )}

            <AddEventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSubmit={handleEventSubmit}
                animalCount={selectedAnimalIds.length}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}