import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthContextType } from '../types/auth';
import {
  findUserByEmail,
  verifyUserPassword,
  saveNewUser,
  formatUserPassword,
  formatUserSecretKey,
  isOwnerAdminEmail,
  INITIAL_REGISTERED_USERS,
  loadUsers,
} from '../utils/userStore';

// Purge all legacy auto-login sessions so nobody is logged in without typing their password
try {
  localStorage.removeItem('playstore_pw_active_session_v4');
  localStorage.removeItem('playstore_pw_active_session_v3');
  localStorage.removeItem('playstore_pw_active_session_v2');
  localStorage.removeItem('playstore_pw_active_session');
  localStorage.removeItem('active_user_session');
} catch {}

const SESSION_AUTH_KEY = 'flexme_verified_session_v5';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalInitialMode, setLoginModalInitialMode] = useState<
    'LOGIN' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY'
  >('LOGIN');

  // Sync active verified session to sessionStorage
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
      }
      window.dispatchEvent(new CustomEvent('app_auth_state_changed', { detail: currentUser }));
    } catch (e) {
      console.error('Failed to sync auth session', e);
    }
  }, [currentUser]);

  const openLoginModal = (mode?: 'LOGIN' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY' | unknown) => {
    if (mode === 'FORMAT_PASSWORD' || mode === 'FORMAT_SECRET_KEY') {
      setLoginModalInitialMode(mode);
    } else {
      setLoginModalInitialMode('LOGIN');
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const checkEmailRegistered = (email: string): boolean => {
    return !!findUserByEmail(email);
  };

  // 1. Sign In With Google
  const loginWithGoogle = (customDetails?: { name?: string; email: string; avatar?: string }) => {
    const rawEmail = customDetails?.email?.trim().toLowerCase() || 'customer.google@gmail.com';
    const isOwner = isOwnerAdminEmail(rawEmail);
    const defaultName = isOwner ? 'FLEX Admin (Owner)' : 'Google Member';
    const name = customDetails?.name?.trim() || defaultName;
    const avatar = customDetails?.avatar || (isOwner 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5,06b6d4,10b981`);

    const profile: UserProfile = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email: rawEmail,
      role: isOwner ? 'admin' : 'customer',
      avatar,
      loginTime: new Date().toISOString(),
      provider: 'google',
    };

    setCurrentUser(profile);
    setIsLoginModalOpen(false);
  };

  // 2. Sign In With Email & Password
  const loginWithEmailPassword = (
    email: string,
    password: string
  ): { success: boolean; message?: string } => {
    const result = verifyUserPassword(email, password);
    if (!result.success || !result.user) {
      return { success: false, message: result.message || 'Incorrect password.' };
    }

    const isOwner = isOwnerAdminEmail(result.user.email);
    const profile: UserProfile = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: isOwner ? 'admin' : result.user.role,
      avatar: result.user.avatar,
      loginTime: new Date().toISOString(),
      provider: 'email',
    };

    setCurrentUser(profile);
    setIsLoginModalOpen(false);
    return { success: true };
  };

  // 3. Register New Account with Email & Password
  const registerNewAccount = (data: {
    name: string;
    email: string;
    password: string;
    secretKey?: string;
  }): { success: boolean; message?: string } => {
    const user = saveNewUser(data);
    const isOwner = isOwnerAdminEmail(user.email);
    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: isOwner ? 'admin' : user.role,
      avatar: user.avatar,
      loginTime: new Date().toISOString(),
      provider: 'email',
    };

    setCurrentUser(profile);
    setIsLoginModalOpen(false);
    return { success: true };
  };

  // 4. Format / Reset Password using Secret Key
  const formatAccountPassword = (data: {
    email: string;
    secretKey: string;
    newPassword: string;
  }): { success: boolean; message: string } => {
    const result = formatUserPassword(data.email, data.secretKey, data.newPassword);
    if (result.success && result.user) {
      if (currentUser && currentUser.email.toLowerCase() === data.email.toLowerCase()) {
        setCurrentUser({
          ...currentUser,
          name: result.user.name,
        });
      }
    }
    return { success: result.success, message: result.message };
  };

  // 5. Format Secret Key using Password
  const formatAccountSecretKey = (data: {
    email: string;
    password: string;
    newSecretKey: string;
  }): { success: boolean; message: string } => {
    const result = formatUserSecretKey(data.email, data.password, data.newSecretKey);
    return { success: result.success, message: result.message };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  };

  const isLoggedIn = currentUser !== null;
  const isAdmin =
    currentUser !== null &&
    (isOwnerAdminEmail(currentUser.email) || currentUser.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isAdmin,
        isLoginModalOpen,
        loginModalInitialMode,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        loginWithEmailPassword,
        registerNewAccount,
        formatAccountPassword,
        formatAccountSecretKey,
        checkEmailRegistered,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: null,
      isLoggedIn: false,
      isAdmin: false,
      isLoginModalOpen: false,
      loginModalInitialMode: 'LOGIN',
      openLoginModal: () => {},
      closeLoginModal: () => {},
      loginWithGoogle: () => {},
      loginWithEmailPassword: () => ({ success: false, message: 'Auth not initialized' }),
      registerNewAccount: () => ({ success: false, message: 'Auth not initialized' }),
      formatAccountPassword: () => ({ success: false, message: 'Auth not initialized' }),
      formatAccountSecretKey: () => ({ success: false, message: 'Auth not initialized' }),
      checkEmailRegistered: () => false,
      logout: () => {},
    };
  }
  return context;
};
