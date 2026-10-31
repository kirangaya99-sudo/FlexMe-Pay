import React from 'react';
import { LoginModal } from './LoginModal';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY';
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = (props) => {
  return <LoginModal {...props} />;
};

export { LoginModal };
