import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Task } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, ClipboardList, Calendar, User, CheckCircle, Filter, LayoutGrid, CalendarDays } from 'lucide-react';
import { TaskModal } from '../../admin/tasks/TaskModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import { TaskCalendar } from './TaskCalendar';
import { TaskDetailModal } from './TaskDetailModal';
import './AsesorTasks.css';

export const AsesorTaskList: React.FC = () => {
    const { tasks, deleteTask, refreshTasks, clients, taskTypes, categories, taskStatuses, users, refreshUsers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

    // View mode: 'panel' or 'calendar'
    const [viewMode, setViewMode] = useState<'panel' | 'calendar'>('panel');

    // Task detail modal for calendar view
    const [detailTask, setDetailTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Filter states
    const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
    const [messengerFilter, setMessengerFilter] = useState<string>('all');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Get messengers for filter dropdown
    const messengers = useMemo(() => {
        return users.filter(u => u.role === 'MENSAJERO');
    }, [users]);

    useEffect(() => {
        refreshTasks();
        refreshUsers();
    }, []);

    // Filter tasks by date and messenger
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Search filter
            const matchesSearch =
                task.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

            // Date filter - compare task's fechaInicio date part with selected date
            let matchesDate = true;
            if (dateFilter) {
                const taskDate = task.fechaInicio ? task.fechaInicio.split('T')[0] : '';
                matchesDate = taskDate === dateFilter;
            }

            // Messenger filter
            let matchesMessenger = true;
            if (messengerFilter !== 'all') {
                matchesMessenger = task.assignedCourierId === messengerFilter;
            }

            return matchesSearch && matchesDate && matchesMessenger;
        });
    }, [tasks, searchTerm, dateFilter, messengerFilter]);

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

    const clearFilters = () => {
        setDateFilter(new Date().toISOString().split('T')[0]);
        setMessengerFilter('all');
        setSearchTerm('');
    };

    const totalTasks = filteredTasks.length;
    const activeTasks = filteredTasks.filter(t => t.proceso).length;
    const assignedTasks = filteredTasks.filter(t => t.assignedCourierId).length;

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Sin cliente';
    };

    const getTaskTypeName = (taskTypeId: string) => {
        const taskType = taskTypes.find(tt => tt.id === taskTypeId);
        return taskType?.name || 'N/A';
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

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="asesor-tasks-container">
            <div className="asesor-tasks-header">
                <div>
                    <h1 className="asesor-tasks-title">Gestión de Tareas</h1>
                    <p className="asesor-tasks-subtitle">Administra las tareas del día.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-task">
                    <Plus size={20} className="mr-2" />
                    Nueva Tarea
                </Button>
            </div>

            {/* Stats */}
            <div className="asesor-tasks-stats-grid">
                <div className="asesor-stat-card">
                    <div>
                        <p className="stat-label">Tareas del Día</p>
                        <h3 className="stat-value">{totalTasks}</h3>
                    </div>
                    <div className="stat-icon-box bg-blue">
                        <ClipboardList size={24} />
                    </div>
                </div>
                <div className="asesor-stat-card">
                    <div>
                        <p className="stat-label">En Proceso</p>
                        <h3 className="stat-value">{activeTasks}</h3>
                    </div>
                    <div className="stat-icon-box bg-green">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="asesor-stat-card">
                    <div>
                        <p className="stat-label">Asignadas</p>
                        <h3 className="stat-value">{assignedTasks}</h3>
                    </div>
                    <div className="stat-icon-box bg-purple">
                        <User size={24} />
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
                <button
                    className={`view-toggle-btn ${viewMode === 'panel' ? 'active' : ''}`}
                    onClick={() => setViewMode('panel')}
                >
                    <LayoutGrid size={18} />
                    Panel
                </button>
                <button
                    className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                    onClick={() => setViewMode('calendar')}
                >
                    <CalendarDays size={18} />
                    Calendario
                </button>
            </div>

            {viewMode === 'panel' ? (
                <>
                    {/* Filters */}
                    <div className="asesor-filters-container">
                        <div className="filters-row">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <Calendar size={16} />
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="filter-input"
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <User size={16} />
                                    Mensajero
                                </label>
                                <select
                                    value={messengerFilter}
                                    onChange={(e) => setMessengerFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Todos los mensajeros</option>
                                    {messengers.map(messenger => (
                                        <option key={messenger.id} value={messenger.id}>
                                            {messenger.firstName} {messenger.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group search-group">
                                <label className="filter-label">
                                    <Search size={16} />
                                    Buscar
                                </label>
                                <input
                                    type="text"
                                    placeholder="Código o nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="filter-input"
                                />
                            </div>

                            <button onClick={clearFilters} className="clear-filters-btn">
                                <Filter size={16} />
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="asesor-tasks-table-container">
                        <table className="asesor-tasks-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Cliente</th>
                                    <th>Tipo</th>
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
                                        <td>
                                            <span className={`status-badge ${task.proceso ? 'status-active' : 'status-completed'}`}>
                                                {getTaskStatusName(task.taskStatusId)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="datetime-cell">
                                                <Calendar size={14} />
                                                <span>{formatDateTime(task.fechaLimite)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {task.assignedCourierId ? (
                                                <div className="messenger-cell">
                                                    <User size={14} />
                                                    <span>{getUserName(task.assignedCourierId)}</span>
                                                </div>
                                            ) : (
                                                <span className="no-assign">Sin asignar</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
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
                            <div className="asesor-tasks-empty-state">
                                <div className="empty-icon-circle">
                                    <ClipboardList size={32} />
                                </div>
                                <h3>No hay tareas</h3>
                                <p>No se encontraron tareas para los filtros seleccionados.</p>
                                <Button onClick={clearFilters} variant="secondary">
                                    Limpiar Filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Calendar View */
                <TaskCalendar
                    tasks={tasks}
                    onTaskClick={(task) => {
                        setDetailTask(task);
                        setIsDetailModalOpen(true);
                    }}
                    getTaskStatusName={getTaskStatusName}
                />
            )}

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
                <div className="error-toast" role="alert">
                    <strong>Error: </strong>
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="error-close">×</button>
                </div>
            )}

            {/* Task Detail Modal for Calendar View */}
            <TaskDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setDetailTask(null);
                }}
                task={detailTask}
                getClientName={getClientName}
                getTaskTypeName={getTaskTypeName}
                getCategoryName={getCategoryName}
                getTaskStatusName={getTaskStatusName}
                getUserName={getUserName}
            />
        </div>
    );
};
