import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
// FIX: Changed import to use validateAdminCredentials as validateAdminPassword does not exist.
import { validateAdminCredentials } from '../services/authService';
import { LoadingSpinnerIcon } from '../components/LoadingSpinner';

interface AdminLoginPageProps {
  onAdminAuthenticated: () => void;
  theme: string;
  toggleTheme: () => void;
  navigateToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminAuthenticated, theme, toggleTheme, navigateToHome }) => {
  // FIX: Added username state to support validateAdminCredentials.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate async check for better UX
    setTimeout(() => {
      // FIX: Switched to validateAdminCredentials with username and password.
      if (validateAdminCredentials(username, password)) {
        onAdminAuthenticated();
      } else {
        // FIX: Updated error message to be more generic.
        setError('Incorrect credentials.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center text-zinc-800 dark:text-zinc-200 font-sans">
      <Header theme={theme} toggleTheme={toggleTheme} onLogoClick={navigateToHome} />
      <main className="w-full flex flex-col items-center justify-center flex-grow p-4">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Admin Panel
            </h1>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              {/* FIX: Updated prompt to ask for credentials. */}
              Please enter your credentials to proceed.
            </p>
          </div>
          <div className="mt-8 w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FIX: Added username input field. */}
              <div>
                <label htmlFor="admin-username" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                  disabled={isLoading}
                  required
                />
              </div>
              {error && <p className="pt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
              <div className="pt-2">
                <button
                  type="submit"
                  // FIX: Updated disabled check to include username.
                  disabled={isLoading || !password.trim() || !username.trim()}
                  className="w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinnerIcon />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
