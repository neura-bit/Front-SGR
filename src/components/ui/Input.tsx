import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="input-wrapper">
                {label && <label className="input-label">{label}</label>}
                <div className="input-container">
                    {icon && <span className="input-icon">{icon}</span>}
                    <input
                        ref={ref}
                        className={`input ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
                        {...props}
                    />
                </div>
                {error && <span className="input-error-text">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
