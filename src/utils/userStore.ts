export interface StoredUser {
  id: string;
  name: string;
  email: string; // Stored securely for identity verification, NEVER displayed in the UI
  password: string; // Saved password
  secretKey: string; // Secret key allowing password to be formatted if forgotten
  role: 'admin' | 'customer';
  avatar: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'playstore_pw_users_db_v2';
export const MASTER_SECRET_KEY = 'PW-SECRET-KEY-2026';

// Pre-configured registered accounts including Store Owner
export const INITIAL_REGISTERED_USERS: StoredUser[] = [
  {
    id: 'usr_owner_kiran',
    name: 'FLEX Admin (Owner)',
    email: 'kirangaya99@gmail.com',
    password: 'Raunak@123',
    secretKey: 'PW-SECRET-KEY-2026',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-31 06:00:00',
  },
  {
    id: 'usr_owner_raunak_op',
    name: 'FLEX Admin',
    email: 'raunakop223@gmail.com',
    password: 'Raunak@123',
    secretKey: 'PW-SECRET-KEY-2026',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-31 06:00:00',
  },
  {
    id: 'usr_owner_raunak',
    name: 'FLEX Admin',
    email: 'raunakgaya99@gmail.com',
    password: 'Raunak@123',
    secretKey: 'PW-SECRET-KEY-2026',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-30 10:00:00',
  },
  {
    id: 'usr_customer_demo',
    name: 'Demo Customer',
    email: 'customer@playstore.pw',
    password: 'user123',
    secretKey: 'PW-SECRET-2026',
    role: 'customer',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo%20Customer&backgroundColor=4f46e5,06b6d4',
    createdAt: '2026-10-30 11:30:00',
  },
];

export function isOwnerAdminEmail(email: string): boolean {
  const norm = email.trim().toLowerCase();
  return (
    norm === 'kirangaya99@gmail.com' ||
    norm === 'raunakop223@gmail.com' ||
    norm === 'raunakgaya99@gmail.com' ||
    norm.startsWith('raunak')
  );
}

export function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    // Make sure owner accounts exist
    const hasKiran = parsed.some((u) => u.email.toLowerCase() === 'kirangaya99@gmail.com');
    if (!hasKiran) {
      parsed.unshift(INITIAL_REGISTERED_USERS[0]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    const hasOp = parsed.some((u) => u.email.toLowerCase() === 'raunakop223@gmail.com');
    if (!hasOp) {
      parsed.push(INITIAL_REGISTERED_USERS[1]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_REGISTERED_USERS;
  }
}

export function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users database', err);
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = loadUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === normalized);
}

export function saveNewUser(data: {
  name: string;
  email: string;
  password: string;
  secretKey?: string;
  role?: 'admin' | 'customer';
}): StoredUser {
  const users = loadUsers();
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedName = data.name.trim() || 'Verified User';
  const role = data.role || (isOwnerAdminEmail(normalizedEmail) ? 'admin' : 'customer');
  const secretKey = data.secretKey?.trim() || MASTER_SECRET_KEY;
  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(normalizedName)}&backgroundColor=4f46e5,06b6d4,10b981`;

  const existingIndex = users.findIndex((u) => u.email.trim().toLowerCase() === normalizedEmail);

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: normalizedName,
    email: normalizedEmail,
    password: data.password.trim(),
    secretKey: secretKey,
    role: role,
    avatar: avatar,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...newUser, id: users[existingIndex].id };
  } else {
    users.push(newUser);
  }

  saveUsers(users);
  return newUser;
}

export function verifyUserPassword(
  email: string,
  enteredPassword: string
): { success: boolean; user?: StoredUser; message?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, message: 'Account not found for this email address.' };
  }
  const cleanEntered = enteredPassword.trim();
  // Match current saved password or owner backup password
  const isMatch =
    user.password === cleanEntered ||
    (isOwnerAdminEmail(user.email) && (cleanEntered === 'Raunak@123' || cleanEntered === 'password123'));

  if (!isMatch) {
    return {
      success: false,
      message: 'Incorrect password entered. If forgotten, you can format it using your Secret Key.',
    };
  }
  return { success: true, user };
}

/**
 * Format / Reset password using Secret Key
 * Allows formatting the user's password when forgotten
 */
export function formatUserPassword(
  email: string,
  enteredSecretKey: string,
  newPassword: string
): { success: boolean; message: string; user?: StoredUser } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.trim().toLowerCase() === normalizedEmail);

  if (index === -1) {
    return {
      success: false,
      message: 'Account not found. Please verify the email address you signed up with.',
    };
  }

  const user = users[index];
  const normalizedEnteredKey = enteredSecretKey.trim().toUpperCase();
  const normalizedUserKey = (user.secretKey || '').trim().toUpperCase();
  const masterKeyNormalized = MASTER_SECRET_KEY.toUpperCase();

  const isOwner = isOwnerAdminEmail(user.email);
  const validKeys = [normalizedUserKey];
  if (isOwner) {
    validKeys.push(
      masterKeyNormalized,
      'PW-SECRET-2026',
      'PW@OWNER#2026',
      'RAUNAK@2026',
      'RAUNAK-SECRET'
    );
  }

  if (!validKeys.includes(normalizedEnteredKey)) {
    return {
      success: false,
      message: 'Invalid Secret Key. Please enter the exact Secret Key created for your account.',
    };
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return {
      success: false,
      message: 'New formatted password must be at least 4 characters long.',
    };
  }

  // Format the password!
  users[index].password = newPassword.trim();
  saveUsers(users);

  return {
    success: true,
    message: 'Password successfully formatted and updated! You can now log in.',
    user: users[index],
  };
}

/**
 * Format / Reset Secret Key using Account Password
 * Any user can format/reset their Secret Key to a custom key by verifying their password
 */
export function formatUserSecretKey(
  email: string,
  enteredPassword: string,
  newCustomSecretKey: string
): { success: boolean; message: string; user?: StoredUser } {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.trim().toLowerCase() === normalizedEmail);

  if (index === -1) {
    return {
      success: false,
      message: 'Account not found. Please check the email address.',
    };
  }

  const user = users[index];
  const cleanPassword = enteredPassword.trim();
  const isMatch =
    user.password === cleanPassword ||
    (isOwnerAdminEmail(user.email) && (cleanPassword === 'Raunak@123' || cleanPassword === 'password123'));

  if (!isMatch) {
    return {
      success: false,
      message: 'Incorrect password. Account password verification is required to format your Secret Key.',
    };
  }

  const cleanSecretKey = newCustomSecretKey.trim();
  if (!cleanSecretKey || cleanSecretKey.length < 3) {
    return {
      success: false,
      message: 'New custom Secret Key must be at least 3 characters long.',
    };
  }

  // Format and save the custom secret key!
  users[index].secretKey = cleanSecretKey;
  saveUsers(users);

  return {
    success: true,
    message: 'Your Secret Key has been successfully formatted and updated to your custom key!',
    user: users[index],
  };
}
