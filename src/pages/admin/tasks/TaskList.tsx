import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Task } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, Calendar, User, Send, Loader2 } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import { taskService } from '../../../services/taskService';
import './Tasks.css';

type DateFilterType = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

interface DateRange {
    fechaInicio: string;
    fechaFin: string;
}

const getDateRange = (filterType: DateFilterType, customStart?: string, customEnd?: string): DateRange => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filterType) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
            break;
        case 'week':
            const dayOfWeek = now.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        case 'custom':
            if (customStart && customEnd) {
                startDate = new Date(customStart + 'T00:00:00');
                endDate = new Date(customEnd + 'T23:59:59');
            } else {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            }
            break;
    }

    const formatDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    return {
        fechaInicio: formatDateTime(startDate),
        fechaFin: formatDateTime(endDate)
    };
};

export const TaskList: React.FC = () => {
    const { deleteTask, clients, taskTypes, categories, taskStatuses, users, refreshClients, refreshTaskTypes, refreshCategories, refreshTaskStatuses, refreshUsers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [dateFilteredTasks, setDateFilteredTasks] = useState<Task[]>([]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Date filter state
    const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);

    const loadFilteredTasks = async () => {
        setIsLoadingTasks(true);
        try {
            const range = getDateRange(dateFilter, customStartDate, customEndDate);
            const tasks = await taskService.getByDateRange(range.fechaInicio, range.fechaFin);
            setDateFilteredTasks(tasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            handleError('Error al cargar las tareas. Intente nuevamente.');
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // Load related data on mount
    useEffect(() => {
        refreshClients();
        refreshTaskTypes();
        refreshCategories();
        refreshTaskStatuses();
        refreshUsers();
    }, []);

    useEffect(() => {
        loadFilteredTasks();
    }, [dateFilter]);

    useEffect(() => {
        if (dateFilter === 'custom' && customStartDate && customEndDate) {
            loadFilteredTasks();
        }
    }, [customStartDate, customEndDate]);

    useEffect(() => {
        let filtered = dateFilteredTasks.filter(
            (task) =>
                task.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply status filter if selected
        if (selectedStatusFilter) {
            filtered = filtered.filter(task => task.taskStatusId === selectedStatusFilter);
        }

        setFilteredTasks(filtered);
    }, [dateFilteredTasks, searchTerm, selectedStatusFilter]);

    // Calculate status counts
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        dateFilteredTasks.forEach((task) => {
            const statusId = task.taskStatusId;
            counts[statusId] = (counts[statusId] || 0) + 1;
        });
        return counts;
    }, [dateFilteredTasks]);

    const handleStatusCardClick = (statusId: string | null) => {
        setSelectedStatusFilter(statusId === selectedStatusFilter ? null : statusId);
    };

    const handleOpenModal = async (task?: Task) => {
        if (task) {
            // Fetch full task details including attachments
            try {
                const fullTask = await taskService.getById(task.id);
                setSelectedTask(fullTask);
            } catch (error) {
                console.error('Error fetching task details:', error);
                // Fallback to the task from list if fetch fails
                setSelectedTask(task);
            }
        } else {
            setSelectedTask(undefined);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedTask(undefined);
        setIsModalOpen(false);
        loadFilteredTasks(); // Refresh after modal closes
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
                loadFilteredTasks(); // Refresh after delete
            } catch (error) {
                handleError('Error al eliminar la tarea. Por favor intente nuevamente.');
            } finally {
                setTaskToDelete(null);
            }
        }
    };

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

    // Check if task is locked (completed or in process - cannot be edited, deleted or resend code)
    const isTaskLocked = (taskStatusId: string) => {
        const taskStatus = taskStatuses.find(ts => ts.id === taskStatusId);
        if (!taskStatus) return false;
        const statusName = taskStatus.name.toUpperCase();
        return statusName === 'COMPLETADA' || statusName === 'EN PROCESO' || statusName === 'EN_PROCESO';
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

    const handleDateFilterChange = (filter: DateFilterType) => {
        setDateFilter(filter);
        if (filter !== 'custom') {
            setCustomStartDate('');
            setCustomEndDate('');
        }
    };

    const getFilterLabel = () => {
        switch (dateFilter) {
            case 'today': return 'Hoy';
            case 'yesterday': return 'Ayer';
            case 'week': return 'Esta Semana';
            case 'month': return 'Este Mes';
            case 'custom': return 'Personalizado';
        }
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

            {/* Date Filter Bar */}
            <div className="date-filter-bar">
                <div className="date-filter-label">
                    <Calendar size={18} />
                    <span>Filtrar por fecha:</span>
                </div>
                <div className="date-filter-buttons">
                    <button
                        className={`date-filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
                        onClick={() => handleDateFilterChange('today')}
                    >
                        Hoy
                    </button>
                    <button
                        className={`date-filter-btn ${dateFilter === 'yesterday' ? 'active' : ''}`}
                        onClick={() => handleDateFilterChange('yesterday')}
                    >
                        Ayer
                    </button>
                    <button
                        className={`date-filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
                        onClick={() => handleDateFilterChange('week')}
                    >
                        Semana
                    </button>
                    <button
                        className={`date-filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
                        onClick={() => handleDateFilterChange('month')}
                    >
                        Mes
                    </button>
                    <button
                        className={`date-filter-btn ${dateFilter === 'custom' ? 'active' : ''}`}
                        onClick={() => handleDateFilterChange('custom')}
                    >
                        Personalizado
                    </button>
                </div>
                {dateFilter === 'custom' && (
                    <div className="custom-date-inputs">
                        <div className="date-input-group">
                            <label>Desde:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <div className="date-input-group">
                            <label>Hasta:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Status Stats Grid */}
            <div className="status-stats-grid">
                <div
                    className={`status-stat-card total ${selectedStatusFilter === null ? '' : 'clickable'}`}
                    onClick={() => handleStatusCardClick(null)}
                >
                    <div className="status-stat-content">
                        <span className="status-stat-label">Total</span>
                        <span className="status-stat-value">{dateFilteredTasks.length}</span>
                    </div>
                    <div className="status-stat-badge">
                        {getFilterLabel()}
                    </div>
                </div>
                {taskStatuses.map((status) => {
                    const count = statusCounts[status.id] || 0;
                    const isSelected = selectedStatusFilter === status.id;
                    return (
                        <div
                            key={status.id}
                            className={`status-stat-card clickable ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleStatusCardClick(status.id)}
                        >
                            <div className="status-stat-content">
                                <span className="status-stat-label">{status.name}</span>
                                <span className="status-stat-value">{count}</span>
                            </div>
                        </div>
                    );
                })}
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
                {isLoadingTasks ? (
                    <div className="tasks-loading-state">
                        <Loader2 size={40} className="loading-spinner" />
                        <p>Cargando tareas...</p>
                    </div>
                ) : (
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
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(task.fechaLimite)}</span>
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
                                            {isDeliveryTask(task.taskTypeId) && !isTaskLocked(task.taskStatusId) && (
                                                <button
                                                    onClick={(e) => handleResendCode(task.id, e)}
                                                    className="action-btn resend"
                                                    title="Reenviar Código"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            )}
                                            {!isTaskLocked(task.taskStatusId) ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400" title="No se puede modificar una tarea completada o en proceso">Bloqueada</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!isLoadingTasks && filteredTasks.length === 0 && (
                    <div className="tasks-empty-state">
                        <div className="empty-icon-circle">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                            No hay tareas que coincidan con tu búsqueda o el filtro de fecha seleccionado.
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
