import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Category } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, Tag } from 'lucide-react';
import './Categories.css';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, onSuccess, onError }) => {
    const { addCategory, updateCategory } = useData();
    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
            });
        } else {
            setFormData({
                name: '',
            });
        }
    }, [category]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (category) {
                if (!category.id) {
                    throw new Error('No se puede actualizar una categoría sin ID válido');
                }
                await updateCategory(category.id, {
                    ...formData,
                });
                if (onSuccess) onSuccess('Categoría actualizada correctamente');
            } else {
                await addCategory({
                    id: `cat${Date.now()}`,
                    ...formData,
                    description: '',
                    color: '#6b7280',
                });
                if (onSuccess) onSuccess('Categoría creada correctamente');
            }
            onClose();
        } catch (error) {
            if (onError) onError('Error al guardar la categoría. Por favor intente nuevamente.');
        }
    };

    return (
        <div className="category-modal-overlay">
            <div className="category-modal-backdrop" onClick={onClose} />

            <div className="category-modal-content">
                <div className="category-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="category-icon-box">
                            <Tag size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {category ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {category ? 'Modifica los datos existentes' : 'Agrega una nueva categoría'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="category-modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="category-modal-form">
                    <div className="space-y-6">
                        <div className="relative">
                            <Input
                                label="Nombre de la Categoría"
                                placeholder="Ej: Entrega, Retiro, Urgente"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="category-modal-actions">
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
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-500/20 rounded-xl"
                        >
                            {category ? 'Guardar Cambios' : 'Crear Categoría'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
