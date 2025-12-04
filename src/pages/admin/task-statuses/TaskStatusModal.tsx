import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { TaskStatusEntity } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, ListChecks } from 'lucide-react';
import './TaskStatuses.css';

interface TaskStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskStatus?: TaskStatusEntity;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const TaskStatusModal: React.FC<TaskStatusModalProps> = ({ isOpen, onClose, taskStatus, onSuccess, onError }) => {
    const { addTaskStatus, updateTaskStatus } = useData();
    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        if (taskStatus) {
            setFormData({
                name: taskStatus.name,
            });
        } else {
            setFormData({
                name: '',
            });
        }
    }, [taskStatus]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (taskStatus) {
                if (!taskStatus.id) {
                    throw new Error('No se puede actualizar un estado sin ID válido');
                }
                await updateTaskStatus(taskStatus.id, {
                    ...formData,
                });
                if (onSuccess) onSuccess('Estado actualizado correctamente');
            } else {
                await addTaskStatus({
                    id: `ts${Date.now()}`,
                    ...formData,
                });
                if (onSuccess) onSuccess('Estado creado correctamente');
            }
            onClose();
        } catch (error) {
            if (onError) onError('Error al guardar el estado. Por favor intente nuevamente.');
        }
    };

    return (
        <div className="task-status-modal-overlay">
            <div className="task-status-modal-backdrop" onClick={onClose} />

            <div className="task-status-modal-content">
                <div className="task-status-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="task-status-icon-box">
                            <ListChecks size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {taskStatus ? 'Editar Estado' : 'Nuevo Estado'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {taskStatus ? 'Modifica los datos existentes' : 'Agrega un nuevo estado de tarea'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="task-status-modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="task-status-modal-form">
                    <div className="space-y-6">
                        <div className="relative">
                            <Input
                                label="Nombre del Estado"
                                placeholder="Ej: CREADA, EN PROCESO, COMPLETADA"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                required
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="task-status-modal-actions">
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
                            {taskStatus ? 'Guardar Cambios' : 'Crear Estado'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
