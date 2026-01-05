
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { issueKeyForDevice, cycleMasterSecret, getManagedUsers, revokeAccessForDevice, ManagedUser, issueCustomKeyForDevice } from '../services/authService';
import { LoadingSpinnerIcon } from '../components/LoadingSpinner';

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const SecurityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

interface UserRowProps {
  user: ManagedUser;
  onRevoke: (deviceId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onRevoke }) => {
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(user.accessKey);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  return (
    <tr className="border-b border-amber-100 dark:border-zinc-700/50 last:border-b-0">
      <td className="py-3 pr-4 font-mono text-xs text-zinc-500 dark:text-zinc-400 truncate" title={user.deviceId}>
        {user.deviceId}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {user.accessKey.substring(0, 8)}...
          </span>
          <button onClick={handleCopyKey} className="text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400" aria-label="Copy Access Key">
            {isKeyCopied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </td>
      <td className="py-3 pl-4 text-right">
        <button 
          onClick={() => onRevoke(user.deviceId)}
          className="flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-zinc-700/50 rounded-lg hover:bg-red-100 dark:hover:bg-zinc-700/80 transition-colors"
          aria-label="Revoke Access"
        >
          <TrashIcon />
          Revoke
        </button>
      </td>
    </tr>
  );
};

interface AdminDashboardPageProps {
  theme: string;
  toggleTheme: () => void;
  onLogout: () => void;
  navigateToHome: () => void;
  navigateToOptimizer: (tab?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ theme, toggleTheme, onLogout, navigateToHome, navigateToOptimizer }) => {
  const [deviceId, setDeviceId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);

  // State for custom key creation
  const [customDeviceId, setCustomDeviceId] = useState('');
  const [customAccessKey, setCustomAccessKey] = useState('');
  const [customKeySaved, setCustomKeySaved] = useState(false);
  const [customKeyError, setCustomKeyError] = useState<string | null>(null);
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);


  const refreshUsers = () => {
    setManagedUsers(getManagedUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleGenerateKey = async () => {
    const trimmedId = deviceId.trim();
    if (!trimmedId) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
        setError('Invalid Device ID format. Please ensure the full ID is copied correctly.');
        return;
    }

    setIsLoading(true);
    setGeneratedKey('');
    setError(null);
    setIsCopied(false);
    
    try {
      const key = await issueKeyForDevice(trimmedId);
      setGeneratedKey(key);
      refreshUsers();
    } catch (err) {
      console.error("Key generation failed:", err);
      setError("Key generation failed. This can happen due to browser issues. Please check the console for details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomKey = () => {
    const trimmedDeviceId = customDeviceId.trim();
    const trimmedKey = customAccessKey.trim();

    if (!trimmedDeviceId || !trimmedKey) {
        setCustomKeyError('Both Device ID and Custom Key are required.');
        return;
    }
    
    setCustomKeyError(null);
    issueCustomKeyForDevice(trimmedDeviceId, trimmedKey);
    setCustomKeySaved(true);
    refreshUsers();
    setCustomDeviceId('');
    setCustomAccessKey('');

    setTimeout(() => {
        setCustomKeySaved(false);
    }, 3000);
  };
  
  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleDeviceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDeviceId(e.target.value);
      if (error) {
          setError(null);
      }
  };

  const handleCycleSecret = () => {
    const isConfirmed = window.confirm(
      "WARNING: This is a high-security action.\n\n" +
      "Regenerating the system secret will immediately invalidate ALL existing access keys. Every user will be logged out and will need a new key to access the application.\n\n" +
      "Are you absolutely sure you want to proceed?"
    );
    if (isConfirmed) {
      cycleMasterSecret();
      refreshUsers();
    }
  };

  const handleRevoke = (userDeviceId: string) => {
    if (window.confirm(`Are you sure you want to revoke access for Device ID: ${userDeviceId}? This action cannot be undone.`)) {
      revokeAccessForDevice(userDeviceId);
      refreshUsers();
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col items-center text-zinc-800 dark:text-zinc-200 font-sans">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onLogout={onLogout} 
        onHomeClick={navigateToHome}
        isAdminAuthenticated={true}
        onHistoryClick={() => navigateToOptimizer('history')}
        onCalendarClick={() => navigateToOptimizer('calendar')}
      />
      <main className="w-full flex flex-col items-center flex-grow p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Admin Dashboard
            </h1>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              Manage user access and system security.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">User Key Management</h2>
              <div>
                <label htmlFor="device-id-input" className="block text-base font-semibold text-zinc-700 dark:text-zinc-300">
                  Generate Secure Key for User
                </label>
                <input
                  id="device-id-input"
                  type="text"
                  value={deviceId}
                  onChange={handleDeviceIdChange}
                  placeholder="Paste the Device ID from the user"
                  className={`mt-3 w-full p-3 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 transition duration-200 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-amber-200 dark:border-zinc-600 focus:ring-amber-500 focus:border-amber-500'}`}
                  disabled={isLoading}
                />
              </div>

              {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-semibold text-center">{error}</p>}

              <div className="mt-4">
                <button
                  onClick={handleGenerateKey}
                  disabled={isLoading || !deviceId.trim()}
                  className="w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinnerIcon />
                      Generating...
                    </>
                  ) : (
                    'Generate Access Key'
                  )}
                </button>
              </div>
              
              {generatedKey && (
                <div className="mt-6 pt-6 border-t border-amber-200 dark:border-zinc-700">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Generated Access Key
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-2">
                    Copy this key and send it to the user.
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={generatedKey}
                      className="w-full p-3 pr-12 text-sm font-mono text-zinc-700 dark:text-zinc-300 bg-green-500/10 dark:bg-green-400/10 rounded-lg border-2 border-green-500/30"
                      aria-label="Generated Access Key"
                    />
                    <button onClick={handleCopyKey} className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 hover:text-green-600 dark:hover:text-green-300" aria-label="Copy Access Key">
                      {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-amber-200 dark:border-zinc-700">
                <button onClick={() => setIsAdvancedVisible(!isAdvancedVisible)} className="flex justify-between items-center w-full text-left font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <span>Advanced: Create Custom Key</span>
                    <ChevronDownIcon />
                </button>
                {isAdvancedVisible && (
                    <div className="mt-4 animate-fade-in-subtle space-y-4">
                         <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/30 p-3 rounded-md">
                            <strong>Security Warning:</strong> Manually creating keys bypasses the secure generation process. Only use this for specific testing or integration purposes where a predictable key is required.
                        </p>
                        <div>
                            <label htmlFor="custom-device-id" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Device ID</label>
                            <input id="custom-device-id" type="text" value={customDeviceId} onChange={(e) => setCustomDeviceId(e.target.value)} placeholder="User's Device ID" className="mt-1 w-full p-2 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                         <div>
                            <label htmlFor="custom-access-key" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Custom Access Key</label>
                            <input id="custom-access-key" type="text" value={customAccessKey} onChange={(e) => setCustomAccessKey(e.target.value)} placeholder="Enter desired access key" className="mt-1 w-full p-2 text-base text-zinc-700 dark:text-zinc-300 bg-amber-100/30 dark:bg-zinc-900/50 rounded-lg border-2 border-amber-200 dark:border-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                        </div>
                        {customKeyError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{customKeyError}</p>}
                        <button onClick={handleSaveCustomKey} disabled={!customDeviceId.trim() || !customAccessKey.trim()} className="w-full flex items-center justify-center px-4 py-2 font-semibold text-amber-700 dark:text-amber-300 bg-amber-200/50 dark:bg-zinc-700 rounded-lg hover:bg-amber-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {customKeySaved ? 'Saved!' : 'Save Custom Key'}
                        </button>
                    </div>
                )}
              </div>
            </div>

            <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-amber-200 dark:border-zinc-700">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">Managed Users ({managedUsers.length})</h2>
              {managedUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="border-b border-amber-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                      <tr>
                        <th className="py-2 pr-4">Device ID</th>
                        <th className="py-2 px-4">Access Key</th>
                        <th className="py-2 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managedUsers.map((user) => (
                        <UserRow key={user.deviceId} user={user} onRevoke={handleRevoke} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">No users have been issued keys yet.</p>
              )}
            </div>

            <div className="w-full p-6 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-red-300 dark:border-red-700/50">
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">System Security</h2>
              <div>
                <label className="block text-base font-semibold text-zinc-700 dark:text-zinc-300">
                  Reset All Access
                </label>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-3">
                  If you suspect a key has been compromised or need to reset all user access for any reason, you can regenerate the system's master secret. This will invalidate all current access keys.
                </p>
                <button
                  onClick={handleCycleSecret}
                  className="w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
                >
                  <SecurityIcon />
                  Regenerate System Secret
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
