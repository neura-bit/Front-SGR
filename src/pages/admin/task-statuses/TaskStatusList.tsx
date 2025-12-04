import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { TaskStatusEntity } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, ListChecks } from 'lucide-react';
import { TaskStatusModal } from './TaskStatusModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './TaskStatuses.css';

export const TaskStatusList: React.FC = () => {
    const { taskStatuses, deleteTaskStatus, refreshTaskStatuses } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatusEntity | undefined>(undefined);
    const [filteredTaskStatuses, setFilteredTaskStatuses] = useState<TaskStatusEntity[]>(taskStatuses);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskStatusToDelete, setTaskStatusToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshTaskStatuses();
    }, []);

    useEffect(() => {
        const filtered = taskStatuses.filter(
            (status) =>
                status.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTaskStatuses(filtered);
    }, [taskStatuses, searchTerm]);

    const handleOpenModal = (taskStatus?: TaskStatusEntity) => {
        setSelectedTaskStatus(taskStatus);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTaskStatus(undefined);
        setIsModalOpen(false);
    };

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 2000);
    };

    const handleError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 3000);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTaskStatusToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskStatusToDelete) {
            try {
                await deleteTaskStatus(taskStatusToDelete);
                handleSuccess('Estado eliminado correctamente');
            } catch (error) {
                handleError('Error al eliminar el estado. Por favor intente nuevamente.');
            } finally {
                setTaskStatusToDelete(null);
            }
        }
    };

    const totalStatuses = taskStatuses.length;

    return (
        <div className="task-statuses-container">
            <div className="task-statuses-header">
                <div>
                    <h1 className="task-statuses-title">Estados de Tarea</h1>
                    <p className="task-statuses-subtitle">Gestiona los estados del ciclo de vida de las tareas.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-task-status">
                    <Plus size={20} className="mr-2" />
                    Nuevo Estado
                </Button>
            </div>

            <div className="task-statuses-stats-grid">
                {[
                    { icon: ListChecks, label: 'Total Estados', value: totalStatuses, color: 'text-gray-900', bg: 'bg-gray-50 dark:bg-gray-900/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="task-statuses-stat-card group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                        </div>
                        <div className={`stat-icon-wrapper ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="task-statuses-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="task-statuses-grid">
                {filteredTaskStatuses.map((taskStatus, index) => (
                    <div
                        key={taskStatus.id || index}
                        onClick={() => handleOpenModal(taskStatus)}
                        className="task-status-card group"
                    >
                        <div className="task-status-card-content">
                            <div className="task-status-card-header">
                                <div className="task-status-icon-box">
                                    <ListChecks size={24} />
                                </div>
                            </div>

                            <div className="task-status-info">
                                <h3 className="task-status-name">{taskStatus.name}</h3>
                            </div>

                            <div className="task-status-actions-overlay">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(taskStatus); }}
                                    className="task-status-action-btn"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(taskStatus.id, e)}
                                    className="task-status-action-btn delete"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTaskStatuses.length === 0 && (
                <div className="task-statuses-empty-state">
                    <div className="empty-icon-circle">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                        No hay estados que coincidan con tu búsqueda o aún no has creado ninguno.
                    </p>
                    <Button onClick={() => setSearchTerm('')} variant="secondary">
                        Limpiar Búsqueda
                    </Button>
                </div>
            )}

            {isModalOpen && (
                <TaskStatusModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    taskStatus={selectedTaskStatus}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Estado"
                message="¿Estás seguro de que deseas eliminar este estado? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />

            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                message={successMessage || ''}
            />

            {errorMessage && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-50 animate-fade-in" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{errorMessage}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMessage(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                    </span>
                </div>
            )}
        </div>
    );
};
