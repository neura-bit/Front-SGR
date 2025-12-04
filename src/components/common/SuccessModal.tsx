import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import './SuccessModal.css';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    duration?: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    message,
    duration = 2000
}) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    return (
        <div className="success-modal-overlay">
            <div className="success-modal-content">
                <div className="success-icon-wrapper">
                    <CheckCircle size={32} />
                </div>
                <p className="success-message">{message}</p>
                <button onClick={onClose} className="success-close-btn">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
