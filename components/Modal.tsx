import React, { ReactNode, useEffect } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  // FIX: Made children optional to resolve TypeScript errors in multiple files
  // where the compiler was not correctly inferring the children prop from JSX.
  children?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Prevent background scroll when modal is open
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // Ensure scroll is restored on unmount
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4 sm:p-6 md:p-10 overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-gradient">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}