import React, { useState } from 'react';
import { Heart, Moon, Sun } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {useTheme} from "../../contexts/useTheme.ts";
import {useAuth} from "../../contexts/useAuth.ts";

export function LoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(credentials.username, credentials.password);
    
    if (!success) {
      setError('Nieprawidłowy login lub hasło');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Login Form */}
          <div className="p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Schronisko dla Zwierząt
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  System zarządzania rejestrem zwierząt
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Login
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Wprowadź login"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hasło
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Wprowadź hasło"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-lg"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    'Zaloguj się'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Demo: login: <span className="font-mono">admin</span>, hasło: <span className="font-mono">admin</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Animal Photos */}
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 lg:flex items-center justify-center hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative z-10 text-center text-white p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
                    alt="Pies w schronisku"
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"
                    alt="Kot w schronisku"
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"
                    alt="Pies w schronisku"
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg"
                    alt="Kot w schronisku"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Pomóż nam dbać o zwierzęta
              </h2>
              <p className="text-lg opacity-90">
                Każde zwierzę zasługuje na miłość i opiekę
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}