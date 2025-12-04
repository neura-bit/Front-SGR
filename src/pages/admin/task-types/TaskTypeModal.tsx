import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { TaskType } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X } from 'lucide-react';
import './TaskTypeModal.css';

interface TaskTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskType?: TaskType;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

export const TaskTypeModal: React.FC<TaskTypeModalProps> = ({
    isOpen,
    onClose,
    taskType,
    onSuccess,
    onError,
}) => {
    const { addTaskType, updateTaskType } = useData();
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (taskType) {
            setName(taskType.name || '');
        } else {
            setName('');
        }
        setErrors({});
    }, [taskType, isOpen]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'El nombre es requerido';
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
            if (taskType) {
                await updateTaskType(taskType.id, { name });
                onSuccess('Tipo de operación actualizado correctamente');
            } else {
                const newTaskType: Omit<TaskType, 'id'> = {
                    name,
                    code: 'entrega',
                    active: true,
                };
                await addTaskType(newTaskType);
                onSuccess('Tipo de operación creado correctamente');
            }
            onClose();
        } catch (error: any) {
            console.error('Error saving task type:', error);
            onError(error.message || 'Error al guardar el tipo de operación');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {taskType ? 'Editar Tipo de Operación' : 'Nuevo Tipo de Operación'}
                    </h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <Input
                        label="Nombre *"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        placeholder="Ej: Entrega, Retiro, etc."
                        autoFocus
                    />

                    <div className="modal-footer">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {taskType ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
