import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Role } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, Shield } from 'lucide-react';
import './Roles.css';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: Role;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, onSuccess, onError }) => {
    const { addRole, updateRole } = useData();
    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
            });
        } else {
            setFormData({
                name: '',
            });
        }
    }, [role]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (role) {
                if (!role.id) {
                    throw new Error('No se puede actualizar un rol sin ID válido');
                }
                await updateRole(role.id, {
                    ...formData,
                });
                if (onSuccess) onSuccess('Rol actualizado correctamente');
            } else {
                await addRole({
                    id: `r${Date.now()}`,
                    ...formData,
                    active: true,
                });
                if (onSuccess) onSuccess('Rol creado correctamente');
            }
            onClose();
        } catch (error) {
            if (onError) onError('Error al guardar el rol. Por favor intente nuevamente.');
        }
    };

    return (
        <div className="role-modal-overlay">
            {/* Backdrop with Blur */}
            <div
                className="role-modal-backdrop"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="role-modal-content">

                {/* Header */}
                <div className="role-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="role-icon-box">
                            <Shield size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {role ? 'Editar Rol' : 'Nuevo Rol'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {role ? 'Modifica los datos existentes' : 'Agrega un nuevo rol al sistema'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="role-modal-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="role-modal-form">
                    <div className="space-y-6">
                        <div className="relative">
                            <Input
                                label="Nombre del Rol"
                                placeholder="Ej: ADMIN, SUPERVISOR, etc."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="role-modal-actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl"
                        >
                            {role ? 'Guardar Cambios' : 'Crear Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
