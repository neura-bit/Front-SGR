import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { User } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X } from 'lucide-react';
import './UserModal.css';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    user,
    onSuccess,
    onError,
}) => {
    const { addUser, updateUser, branches, roles } = useData();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        username: '',
        password: '',
        active: true,
        branchId: '',
        roleId: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                username: user.username || '',
                password: '', // Don't populate password on edit
                active: user.active,
                branchId: user.branchId || '',
                roleId: user.roleId || '',
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                username: '',
                password: '',
                active: true,
                branchId: '',
                roleId: '',
            });
        }
        setErrors({});
    }, [user, isOpen]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }
        if (!formData.username.trim()) {
            newErrors.username = 'El usuario es requerido';
        }
        if (!user && !formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida';
        }
        if (!formData.branchId) {
            newErrors.branchId = 'La sucursal es requerida';
        }
        if (!formData.roleId) {
            newErrors.roleId = 'El rol es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (user) {
                // On update, only send password if it was changed
                const updateData: Partial<User> = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    username: formData.username,
                    active: formData.active,
                    branchId: formData.branchId,
                    roleId: formData.roleId,
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await updateUser(user.id, updateData);
                onSuccess('Usuario actualizado correctamente');
            } else {
                await addUser(formData);
                onSuccess('Usuario creado correctamente');
            }
            onClose();
        } catch (error: any) {
            console.error('Error saving user:', error);
            onError(error.message || 'Error al guardar el usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <Input
                            label="Nombre *"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            error={errors.firstName}
                            placeholder="Ej: Juan"
                        />

                        <Input
                            label="Apellido *"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            error={errors.lastName}
                            placeholder="Ej: Pérez"
                        />
                    </div>

                    <div className="form-grid">
                        <Input
                            label="Teléfono"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Ej: 0999999999"
                        />

                        <Input
                            label="Usuario *"
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            error={errors.username}
                            placeholder="Ej: jperez"
                        />
                    </div>

                    <Input
                        label={user ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={errors.password}
                        placeholder="••••••••"
                    />

                    <div className="form-grid">
                        <div className="input-wrapper">
                            <label className="input-label">Sucursal *</label>
                            <select
                                value={formData.branchId}
                                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                className={`input ${errors.branchId ? 'input-error' : ''}`}
                            >
                                <option value="">Seleccione una sucursal</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            {errors.branchId && <span className="input-error-text">{errors.branchId}</span>}
                        </div>

                        <div className="input-wrapper">
                            <label className="input-label">Rol *</label>
                            <select
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                className={`input ${errors.roleId ? 'input-error' : ''}`}
                            >
                                <option value="">Seleccione un rol</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {errors.roleId && <span className="input-error-text">{errors.roleId}</span>}
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="checkbox-input"
                            />
                            <span>Usuario activo</span>
                        </label>
                    </div>

                    <div className="modal-footer">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {user ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
