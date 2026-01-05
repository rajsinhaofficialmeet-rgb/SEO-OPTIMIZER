// This service provides a basic, frontend-only authentication mechanism.
// It is designed to prevent casual access but is not a substitute for a
// proper backend authentication system.

const ADMIN_SESSION_KEY = 'admin_session_active';

// Admin credentials as specified by the user.
const ADMINS = [
  { username: 'Mentors@9274', password: '061800' },
  { username: 'Mentors@9308', password: '008854' },
  { username: 'Mentors@9278', password: '172183' },
];

/**
 * Validates the master admin credentials.
 */
export const validateAdminCredentials = (username?: string, password?: string): boolean => {
  if (!username || !password) return false;
  return ADMINS.some(admin => admin.username === username && admin.password === password);
};

/**
 * Checks if there is an active admin session.
 */
export const checkAdminAuthentication = (): boolean => {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true' || sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

/**
 * Starts an admin session.
 */
export const loginAdmin = (rememberMe: boolean): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(ADMIN_SESSION_KEY, 'true');
};

/**
 * Ends an admin session.
 */
export const logoutAdmin = (): void => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

// --- Multi-User Key Management ---
// FIX: Added missing functions and types for the Admin Dashboard feature.
// The following section is for a more advanced, device-based access system.

const MANAGED_USERS_KEY = 'managed_users';

export interface ManagedUser {
  deviceId: string;
  accessKey: string;
}

const saveManagedUsers = (users: ManagedUser[]) => {
  try {
    localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save managed users to localStorage", error);
  }
};

export const getManagedUsers = (): ManagedUser[] => {
  try {
    const usersRaw = localStorage.getItem(MANAGED_USERS_KEY);
    return usersRaw ? JSON.parse(usersRaw) : [];
  } catch (error) {
    console.error("Failed to parse managed users from localStorage", error);
    return [];
  }
};

export const revokeAccessForDevice = (deviceId: string): void => {
  const users = getManagedUsers();
  const updatedUsers = users.filter(user => user.deviceId !== deviceId);
  saveManagedUsers(updatedUsers);
};

const generateSecureKey = (): string => {
    // Generates a pseudo-random key. Not cryptographically secure, but suitable for this simulation.
    return 'key_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const issueKeyForDevice = async (deviceId: string): Promise<string> => {
  let users = getManagedUsers();
  const existingUser = users.find(user => user.deviceId === deviceId);
  if (existingUser) {
    // To prevent duplicate keys and ensure a fresh key is always provided, remove old entry.
    users = users.filter(u => u.deviceId !== deviceId);
  }
  
  const newKey = generateSecureKey();
  const newUser: ManagedUser = { deviceId, accessKey: newKey };
  
  saveManagedUsers([...users, newUser]);

  return newKey;
};

export const issueCustomKeyForDevice = (deviceId: string, accessKey: string): void => {
    let users = getManagedUsers();
    // Remove existing user if they exist to update their key
    users = users.filter(user => user.deviceId !== deviceId);
    
    const newUser: ManagedUser = { deviceId, accessKey };
    users.push(newUser);
    saveManagedUsers(users);
};

export const cycleMasterSecret = (): void => {
    // This is a high-security action. For this frontend-only implementation,
    // we'll clear all issued keys to simulate a full reset.
    saveManagedUsers([]);
    // In a real backend system, this would involve creating a new secret
    // and using it to sign new keys.
    console.warn("Master secret has been cycled. All existing user keys are now invalid.");
};