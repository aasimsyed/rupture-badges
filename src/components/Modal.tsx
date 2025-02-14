import { useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative max-w-4xl w-full bg-punk-black rounded-lg shadow-xl">
          <button
            onClick={onClose}
            title="Close modal"
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          {children}
        </div>
      </div>
    </div>
  );
} 