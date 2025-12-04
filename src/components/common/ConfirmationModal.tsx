import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-backdrop" onClick={onClose} />

            <div className="confirmation-modal-content">
                <div className={`confirmation-icon-wrapper ${variant}`}>
                    <AlertTriangle size={32} />
                </div>

                <h3 className="confirmation-title">{title}</h3>
                <p className="confirmation-message">{message}</p>

                <div className="confirmation-actions">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="confirmation-btn-cancel"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="confirmation-btn-confirm"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
