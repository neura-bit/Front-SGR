import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../ui/Card';
import { Users, Package, Clock, CheckCircle, XCircle, FileText, MapPin } from 'lucide-react';
import './CourierTasksPanel.css';

interface CourierTasksPanelProps {
    className?: string;
}

export const CourierTasksPanel: React.FC<CourierTasksPanelProps> = ({ className }) => {
    const { tasks, users, taskStatuses, clients } = useData();
    const [selectedCourierId, setSelectedCourierId] = useState<string>('');

    // Get all couriers (users with role MENSAJERO)
    const couriers = useMemo(() =>
        users.filter(u => u.role === 'MENSAJERO' && u.active),
        [users]
    );

    // Get tasks for the selected courier
    const courierTasks = useMemo(() =>
        selectedCourierId
            ? tasks.filter(t => t.assignedCourierId === selectedCourierId)
            : [],
        [tasks, selectedCourierId]
    );

    // Get task status name by ID
    const getTaskStatusName = (taskStatusId: string) => {
        const status = taskStatuses.find(s => s.id === taskStatusId);
        return status?.name?.toUpperCase() || 'N/A';
    };

    // Get client name by ID
    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Sin cliente';
    };

    // Get client address by ID
    const getClientAddress = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.address || 'Sin dirección';
    };

    // Group tasks by status name and count them
    const taskCountsByStatus = useMemo(() => {
        const counts: Record<string, number> = {};

        courierTasks.forEach(task => {
            const statusName = getTaskStatusName(task.taskStatusId);
            counts[statusName] = (counts[statusName] || 0) + 1;
        });

        return counts;
    }, [courierTasks, taskStatuses]);

    // Define status display configuration
    const statusConfig = [
        { name: 'CREADA', icon: FileText, color: 'status-created', bgColor: 'bg-slate' },
        { name: 'ASIGNADA', icon: Users, color: 'status-assigned', bgColor: 'bg-blue' },
        { name: 'EN PROCESO', icon: Clock, color: 'status-in-progress', bgColor: 'bg-orange' },
        { name: 'COMPLETADA', icon: CheckCircle, color: 'status-completed', bgColor: 'bg-green' },
        { name: 'CANCELADA', icon: XCircle, color: 'status-cancelled', bgColor: 'bg-red' },
    ];

    const selectedCourier = couriers.find(c => c.id === selectedCourierId);

    return (
        <Card className={`courier-tasks-panel ${className || ''}`}>
            <CardHeader
                title="Tareas por Mensajero"
                subtitle="Selecciona un mensajero para ver sus tareas asignadas"
            />

            <div className="courier-selector">
                <div className="selector-icon">
                    <Users size={20} />
                </div>
                <select
                    value={selectedCourierId}
                    onChange={(e) => setSelectedCourierId(e.target.value)}
                    className="courier-select"
                >
                    <option value="">-- Seleccionar Mensajero --</option>
                    {couriers.map(courier => (
                        <option key={courier.id} value={courier.id}>
                            {courier.firstName} {courier.lastName}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourierId && (
                <>
                    {/* Status Stats Cards */}
                    <div className="status-stats-grid">
                        {statusConfig.map(status => {
                            const count = taskCountsByStatus[status.name] || 0;
                            const Icon = status.icon;
                            return (
                                <div key={status.name} className={`status-stat-card ${status.bgColor}`}>
                                    <div className="status-stat-icon">
                                        <Icon size={20} />
                                    </div>
                                    <div className="status-stat-info">
                                        <div className="status-stat-count">{count}</div>
                                        <div className="status-stat-label">{status.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total Tasks */}
                    <div className="courier-total-tasks">
                        <Package size={18} />
                        <span>
                            <strong>{courierTasks.length}</strong> tareas asignadas a{' '}
                            <strong>{selectedCourier?.firstName} {selectedCourier?.lastName}</strong>
                        </span>
                    </div>

                    {/* Task List */}
                    <div className="courier-task-list">
                        {courierTasks.length === 0 ? (
                            <div className="empty-tasks-message">
                                <Package size={32} />
                                <p>No hay tareas asignadas a este mensajero</p>
                            </div>
                        ) : (
                            courierTasks.map(task => (
                                <div key={task.id} className="courier-task-item">
                                    <div className="task-item-info">
                                        <div className="task-item-name">{task.nombre}</div>
                                        <div className="task-item-client">
                                            <MapPin size={12} />
                                            {getClientName(task.clientId)} - {getClientAddress(task.clientId)}
                                        </div>
                                        <div className="task-item-code">Código: {task.codigo}</div>
                                    </div>
                                    <div className={`task-item-status ${getTaskStatusName(task.taskStatusId).toLowerCase().replace(' ', '-')}`}>
                                        {getTaskStatusName(task.taskStatusId)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {!selectedCourierId && (
                <div className="no-courier-selected">
                    <Users size={48} />
                    <p>Selecciona un mensajero para ver sus tareas</p>
                </div>
            )}
        </Card>
    );
};
