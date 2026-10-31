export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar: string;
  loginTime: string;
  provider: 'google' | 'email';
}

export const OWNER_ADMIN_EMAIL = 'raunakop223@gmail.com';

export const OWNER_ADMIN_EMAILS = [
  'raunakop223@gmail.com',
  'raunakgaya99@gmail.com',
  'kirangaya99@gmail.com',
];

export interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoginModalOpen: boolean;
  loginModalInitialMode: 'LOGIN' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY';
  openLoginModal: (mode?: 'LOGIN' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY' | unknown) => void;
  closeLoginModal: () => void;
  loginWithGoogle: (customDetails?: { name?: string; email: string; avatar?: string }) => void;
  loginWithEmailPassword: (
    email: string,
    password: string
  ) => { success: boolean; message?: string };
  registerNewAccount: (data: {
    name: string;
    email: string;
    password: string;
    secretKey?: string;
  }) => { success: boolean; message?: string };
  formatAccountPassword: (data: {
    email: string;
    secretKey: string;
    newPassword: string;
  }) => { success: boolean; message: string };
  formatAccountSecretKey: (data: {
    email: string;
    password: string;
    newSecretKey: string;
  }) => { success: boolean; message: string };
  checkEmailRegistered: (email: string) => boolean;
  logout: () => void;
}
