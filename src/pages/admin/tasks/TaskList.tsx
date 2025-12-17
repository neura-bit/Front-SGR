import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Task } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, ClipboardList, Calendar, User, CheckCircle, Send } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import { taskService } from '../../../services/taskService';
import './Tasks.css';

export const TaskList: React.FC = () => {
    const { tasks, deleteTask, refreshTasks, clients, taskTypes, categories, taskStatuses, users } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshTasks();
    }, []);

    useEffect(() => {
        const filtered = tasks.filter(
            (task) =>
                task.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTasks(filtered);
    }, [tasks, searchTerm]);

    const handleOpenModal = (task?: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTask(undefined);
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
        setTaskToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete) {
            try {
                await deleteTask(taskToDelete);
                handleSuccess('Tarea eliminada correctamente');
            } catch (error) {
                handleError('Error al eliminar la tarea. Por favor intente nuevamente.');
            } finally {
                setTaskToDelete(null);
            }
        }
    };

    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => t.proceso).length;
    const completedTasks = tasks.filter(t => t.fechaFin).length;

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Sin cliente';
    };

    const getTaskTypeName = (taskTypeId: string) => {
        const taskType = taskTypes.find(tt => tt.id === taskTypeId);
        return taskType?.name || 'N/A';
    };

    const isDeliveryTask = (taskTypeId: string) => {
        const taskType = taskTypes.find(tt => tt.id === taskTypeId);
        return taskType?.code === 'entrega';
    };

    const handleResendCode = async (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await taskService.resendCode(taskId);
            handleSuccess(response.mensaje || 'Código reenviado exitosamente');
        } catch (error) {
            handleError('Error al reenviar el código. Por favor intente nuevamente.');
        }
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'N/A';
    };

    const getTaskStatusName = (taskStatusId: string) => {
        const taskStatus = taskStatuses.find(ts => ts.id === taskStatusId);
        return taskStatus?.name || 'N/A';
    };

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : 'N/A';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <div>
                    <h1 className="tasks-title">Tareas</h1>
                    <p className="tasks-subtitle">Gestiona las tareas del sistema.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-task">
                    <Plus size={20} className="mr-2" />
                    Nueva Tarea
                </Button>
            </div>

            <div className="tasks-stats-grid">
                <div className="tasks-stat-card group">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Tareas</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalTasks}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                        <ClipboardList size={24} />
                    </div>
                </div>
                <div className="tasks-stat-card group">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tareas Activas</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{activeTasks}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-green-50 dark:bg-green-900/20 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="tasks-stat-card group">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tareas Completadas</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{completedTasks}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </div>

            <div className="tasks-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="tasks-table-container">
                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                            <th>Fecha Límite</th>
                            <th>Mensajero</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((task) => (
                            <tr key={task.id}>
                                <td>
                                    <span className="task-code">{task.codigo}</span>
                                </td>
                                <td>
                                    <div className="task-name-cell">
                                        <span className="font-medium">{task.nombre}</span>
                                    </div>
                                </td>
                                <td>{getClientName(task.clientId)}</td>
                                <td>
                                    <span className="task-type-badge">{getTaskTypeName(task.taskTypeId)}</span>
                                </td>
                                <td>{getCategoryName(task.categoryId)}</td>
                                <td>
                                    <span className={`status-badge ${task.proceso ? 'status-active' : 'status-inactive'}`}>
                                        {getTaskStatusName(task.taskStatusId)}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                        <Calendar size={14} />
                                        <span className="text-sm">{formatDate(task.fechaLimite)}</span>
                                    </div>
                                </td>
                                <td>
                                    {task.assignedCourierId ? (
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                            <User size={14} />
                                            <span className="text-sm">{getUserName(task.assignedCourierId)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sin asignar</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {isDeliveryTask(task.taskTypeId) && (
                                            <button
                                                onClick={(e) => handleResendCode(task.id, e)}
                                                className="action-btn resend"
                                                title="Reenviar Código"
                                            >
                                                <Send size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenModal(task)}
                                            className="action-btn edit"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(task.id, e)}
                                            className="action-btn delete"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredTasks.length === 0 && (
                    <div className="tasks-empty-state">
                        <div className="empty-icon-circle">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                            No hay tareas que coincidan con tu búsqueda o aún no has creado ninguna.
                        </p>
                        <Button onClick={() => setSearchTerm('')} variant="secondary">
                            Limpiar Búsqueda
                        </Button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    task={selectedTask}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Tarea"
                message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
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
