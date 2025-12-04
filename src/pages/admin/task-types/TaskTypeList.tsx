import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { TaskType } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';
import { TaskTypeModal } from './TaskTypeModal.tsx';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './TaskTypes.css';

export const TaskTypeList: React.FC = () => {
    const { taskTypes, deleteTaskType, refreshTaskTypes } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskType, setSelectedTaskType] = useState<TaskType | undefined>(undefined);
    const [filteredTaskTypes, setFilteredTaskTypes] = useState<TaskType[]>(taskTypes);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskTypeToDelete, setTaskTypeToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshTaskTypes();
    }, []);

    useEffect(() => {
        const filtered = taskTypes.filter(
            (tt) =>
                tt.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTaskTypes(filtered);
    }, [taskTypes, searchTerm]);

    const handleOpenModal = (taskType?: TaskType) => {
        setSelectedTaskType(taskType);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTaskType(undefined);
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
        setTaskTypeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskTypeToDelete) {
            try {
                await deleteTaskType(taskTypeToDelete);
                handleSuccess('Tipo de operación eliminado correctamente');
            } catch (error) {
                handleError('Error al eliminar el tipo de operación. Por favor intente nuevamente.');
            } finally {
                setTaskTypeToDelete(null);
            }
        }
    };

    const totalTaskTypes = taskTypes.length;

    return (
        <div className="task-types-container">
            <div className="task-types-header">
                <div>
                    <h1 className="task-types-title">Tipos de Operación</h1>
                    <p className="task-types-subtitle">Define los tipos de operaciones disponibles en el sistema.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-task-type">
                    <Plus size={20} className="mr-2" />
                    Nuevo Tipo de Operación
                </Button>
            </div>

            <div className="task-types-stats-grid">
                {[
                    { icon: FileText, label: 'Total Tipos', value: totalTaskTypes, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="task-types-stat-card group">
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

            <div className="task-types-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de tipo de operación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="task-types-grid">
                {filteredTaskTypes.map((taskType, index) => (
                    <div
                        key={taskType.id || index}
                        onClick={() => handleOpenModal(taskType)}
                        className="task-type-card group"
                    >
                        <div className="task-type-card-content">
                            <div className="task-type-card-header">
                                <div className="task-type-icon-box">
                                    <FileText size={24} />
                                </div>
                            </div>

                            <div className="task-type-info">
                                <h3 className="task-type-name">{taskType.name}</h3>
                            </div>

                            <div className="task-type-actions-overlay">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(taskType); }}
                                    className="task-type-action-btn"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(taskType.id, e)}
                                    className="task-type-action-btn delete"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTaskTypes.length === 0 && (
                <div className="task-types-empty-state">
                    <div className="empty-icon-circle">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                        No hay tipos de operación que coincidan con tu búsqueda o aún no has creado ninguno.
                    </p>
                    <Button onClick={() => setSearchTerm('')} variant="secondary">
                        Limpiar Búsqueda
                    </Button>
                </div>
            )}

            {isModalOpen && (
                <TaskTypeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    taskType={selectedTaskType}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Tipo de Operación"
                message="¿Estás seguro de que deseas eliminar este tipo de operación? Esta acción no se puede deshacer."
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
