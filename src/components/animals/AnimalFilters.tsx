import React from 'react';
import { Search } from 'lucide-react';
import { FilterType } from '../../types';

interface AnimalFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function AnimalFilters({ searchTerm, onSearchChange, filter, onFilterChange }: AnimalFiltersProps) {
  const filterOptions = [
    { value: 'psy-w-schronisku' as FilterType, label: 'Psy w schronisku' },
    { value: 'koty-w-schronisku' as FilterType, label: 'Koty w schronisku' },
    { value: 'psy-poza-schroniskiem' as FilterType, label: 'Psy poza schroniskiem' },
    { value: 'koty-poza-schroniskiem' as FilterType, label: 'Koty poza schroniskiem' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Szukaj zwierząt..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtruj zwierzęta
          </label>
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as FilterType)}
            className="block w-full px-3 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}