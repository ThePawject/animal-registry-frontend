import {ThemeProvider} from './contexts/ThemeContext';
import {AuthProvider} from './contexts/AuthContext';
import {LoginForm} from './components/auth/LoginForm';
import {Header} from './components/layout/Header';
import {AnimalRegistry} from './components/animals/AnimalRegistry';
import {LoadingSpinner} from './components/ui/LoadingSpinner';
import {useAuth} from "./contexts/useAuth.ts";

function AppContent() {
    const {user, isLoading} = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg"/>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Ładowanie aplikacji...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginForm/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header/>
            <main>
                <AnimalRegistry/>
            </main>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent/>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
