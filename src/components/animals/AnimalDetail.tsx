import React, { useState } from 'react';
import { X, Edit, Printer, Heart, Calendar, Clock, User, FileText } from 'lucide-react';
import { Animal } from '../../types';

interface AnimalDetailProps {
  animal: Animal;
  onClose: () => void;
}

export function AnimalDetail({ animal, onClose }: AnimalDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'medical'>('details');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {animal.name} ({animal.signature})
                </h1>
                <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                  animal.isInShelter 
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {animal.isInShelter ? 'W schronisku' : 'Adoptowane'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Edytuj dane zwierzaka
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Printer className="w-4 h-4 mr-2" />
                  Drukuj raport
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photos */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Zdjęcia
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {animal.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo}
                        alt={`${animal.name} - zdjęcie ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2">
              {/* Basic Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {animal.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {animal.species === 'pies' ? 'Pies' : 'Kot'} • {animal.gender === 'on' ? 'Samiec' : 'Samica'} • {calculateAge(animal.birthDate)} lat
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sygnatura
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-mono">
                      {animal.signature}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Numer czipu
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white font-mono">
                      {animal.chipNumber}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kolor
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {animal.color}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data urodzenia
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formatDate(animal.birthDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'details'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Historia zdarzeń
                    </button>
                    <button
                      onClick={() => setActiveTab('medical')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'medical'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Heart className="w-4 h-4 inline mr-2" />
                      Apteczka
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      {animal.events.map((event) => (
                        <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {event.type}
                              </h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(event.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <User className="w-4 h-4 inline mr-1" />
                              {event.performedBy}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              {event.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'medical' && (
                    <div className="space-y-4">
                      {animal.medicalRecords.map((record) => (
                        <div key={record.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                            <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {formatDate(record.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              {record.note}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {animal.medicalRecords.length === 0 && (
                        <div className="text-center py-8">
                          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Brak wpisów medycznych
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt={animal.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}