import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Branch } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, Building2 } from 'lucide-react';
import './Branches.css';

interface BranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branch?: Branch;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, branch, onSuccess, onError }) => {
    const { addBranch, updateBranch } = useData();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                city: branch.city,
                phone: branch.phone,
            });
        } else {
            setFormData({
                name: '',
                address: '',
                city: '',
                phone: '',
            });
        }
    }, [branch]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        try {
            if (branch) {
                if (!branch.id) {
                    throw new Error('No se puede actualizar una sucursal sin ID válido');
                }
                await updateBranch(branch.id, {
                    ...formData,
                });
                if (onSuccess) onSuccess('Sucursal actualizada correctamente');
            } else {
                await addBranch({
                    id: `b${Date.now()}`,
                    ...formData,


                });
                if (onSuccess) onSuccess('Sucursal creada correctamente');
            }
            onClose();
        } catch (error) {
            if (onError) onError('Error al guardar la sucursal. Por favor intente nuevamente.');
        }
    };

    return (
        <div className="branch-modal-overlay">
            {/* Backdrop with Blur */}
            <div
                className="branch-modal-backdrop"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="branch-modal-content">

                {/* Header */}
                <div className="branch-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="branch-icon-box">
                            <Building2 size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {branch ? 'Editar Sucursal' : 'Nueva Sucursal'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {branch ? 'Modifica los datos existentes' : 'Agrega un nuevo punto a tu red'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="branch-modal-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="branch-modal-form">
                    <div className="space-y-6">
                        <div className="relative">
                            <Input
                                label="Nombre de la Sede"
                                placeholder="Ej: Sede Principal - Norte"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="pl-10"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Ciudad"
                                placeholder="Bogotá"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />

                            <Input
                                label="Teléfono"
                                placeholder="+57 300 123..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Dirección Física"
                            placeholder="Calle 100 #15-20, Oficina 301"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>

                    <div className="branch-modal-actions">
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
                            {branch ? 'Guardar Cambios' : 'Crear Sucursal'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};