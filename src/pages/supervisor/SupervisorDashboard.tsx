import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Users, Package, User } from 'lucide-react';
import { CourierTasksPanel } from '../../components/shared/CourierTasksPanel';

export const SupervisorDashboard: React.FC = () => {
    const { tasks, users, taskStatuses } = useData();
    const couriers = users.filter((u) => u.role === 'MENSAJERO');

    // Active tasks are those with proceso = true
    const activeTasks = tasks.filter(t => t.proceso);

    // Get courier name by ID
    const getCourierName = (courierId: string | null | undefined) => {
        if (!courierId) return null;
        const courier = users.find(u => u.id === courierId);
        return courier ? `${courier.firstName} ${courier.lastName}` : null;
    };

    // Get task status name by ID
    const getTaskStatusName = (taskStatusId: string) => {
        const status = taskStatuses.find(s => s.id === taskStatusId);
        return status?.name || 'N/A';
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-lg">
                <h1>Dashboard del Supervisor</h1>
                <p className="text-secondary">Supervisión y asignación de tareas</p>
            </div>

            <div className="grid grid-cols-2">
                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-info">
                            <Package size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{activeTasks.length}</div>
                            <div className="stat-label">Tareas Activas</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-warning">
                            <Users size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{couriers.length}</div>
                            <div className="stat-label">Mensajeros</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-lg">
                <Card>
                    <CardHeader title="Tareas para Asignar" subtitle="Gestiona las asignaciones de mensajeros" />
                    <div className="task-list">
                        {activeTasks.length === 0 ? (
                            <div className="text-center py-4 text-secondary">
                                No hay tareas activas
                            </div>
                        ) : (
                            activeTasks.slice(0, 10).map((task) => (
                                <div key={task.id} className="task-item">
                                    <div className="task-info">
                                        <div className="task-title">{task.nombre}</div>
                                        <div className="text-sm text-tertiary flex items-center gap-1">
                                            <User size={12} />
                                            {getCourierName(task.assignedCourierId)
                                                ? `Asignado a: ${getCourierName(task.assignedCourierId)}`
                                                : 'Sin asignar'}
                                        </div>
                                    </div>
                                    <span className={`status-badge ${task.fechaFin ? 'status-completed' : task.proceso ? 'status-in-progress' : 'status-pending'}`}>
                                        {getTaskStatusName(task.taskStatusId)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            <div className="mt-lg">
                <CourierTasksPanel />
            </div>
        </div>
    );
};
