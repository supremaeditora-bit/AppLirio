import React from 'react';
import Button from './Button';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  // FIX: Added optional confirmVariant prop to allow for different button styles.
  confirmVariant?: 'primary' | 'danger';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  // FIX: Default confirmVariant to 'danger' to maintain existing behavior where this prop is not provided.
  confirmVariant = 'danger',
}: ConfirmationModalProps) {

  // FIX: Conditionally apply danger styles based on the confirmVariant prop.
  const confirmButtonClasses = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white dark:text-white'
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="font-sans text-marrom-seiva dark:text-creme-velado/90">{message}</p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isLoading} className={confirmButtonClasses}>
            {isLoading ? '...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}