import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { validateAdminCredentials } from '../services/authService';
import { LoadingSpinnerIcon } from '../components/LoadingSpinner';

interface AccessPageProps {
  onAdminAuthenticated: (rememberMe: boolean) => void;
  theme: string;
  toggleTheme: () => void;
  navigateToHome: () => void;
}

export const AccessPage: React.FC<AccessPageProps> = ({ onAdminAuthenticated, theme, toggleTheme, navigateToHome }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate async check for better UX
        setTimeout(() => {
            if (validateAdminCredentials(username, password)) {
                onAdminAuthenticated(rememberMe);
            } else {
                setError('Invalid credentials. Please try again.');
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center text-zinc-800 dark:text-zinc-200 font-sans">
            <Header 
                theme={theme} 
                toggleTheme={toggleTheme} 
                onHomeClick={navigateToHome}
                onLogoClick={navigateToHome}
            />
            <main className="w-full flex flex-col items-center justify-center flex-grow p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                            Admin Access
                        </h1>
                        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
                            Please sign in to continue.
                        </p>
                    </div>

                    <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
                        <div className="animate-fade-in-subtle">
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="admin-username" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                        Admin Username
                                    </label>
                                    <input
                                        id="admin-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your admin username"
                                        className="mt-2 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="admin-password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    Admin Password
                                    </label>
                                    <input
                                        id="admin-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your admin password"
                                        className="mt-2 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me-admin"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-300 dark:border-zinc-600 rounded bg-amber-100/30 dark:bg-zinc-900/50"
                                        />
                                        <label htmlFor="remember-me-admin" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                                            Remember me
                                        </label>
                                    </div>
                                </div>

                                {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !username.trim() || !password.trim()}
                                        className="w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:shadow-none"
                                    >
                                        {isLoading ? (
                                            <><LoadingSpinnerIcon /> Signing In...</>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
