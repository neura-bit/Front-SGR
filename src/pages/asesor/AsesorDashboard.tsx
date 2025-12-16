import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import { CourierTasksPanel } from '../../components/shared/CourierTasksPanel';

export const AsesorDashboard: React.FC = () => {
    const { tasks, clients, taskStatuses } = useData();
    const recentTasks = tasks.slice(0, 10);

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

    // Get task status name by ID
    const getTaskStatusName = (taskStatusId: string) => {
        const status = taskStatuses.find(s => s.id === taskStatusId);
        return status?.name || 'N/A';
    };

    // Count completed tasks (those with fechaFin set)
    const completedCount = tasks.filter(t => t.fechaFin).length;

    // Count active tasks (proceso = true)
    const activeCount = tasks.filter(t => t.proceso).length;

    return (
        <div className="animate-fade-in">
            <div className="mb-lg">
                <h1>Dashboard del Asesor</h1>
                <p className="text-secondary">Gestión de tareas y asignaciones</p>
            </div>

            <div className="grid grid-cols-3">
                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-primary">
                            <Package size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{tasks.length}</div>
                            <div className="stat-label">Total Tareas</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-warning">
                            <Clock size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{activeCount}</div>
                            <div className="stat-label">En Proceso</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-success">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{completedCount}</div>
                            <div className="stat-label">Completadas</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-lg">
                <Card>
                    <CardHeader title="Tareas Recientes" />
                    <div className="task-list">
                        {recentTasks.length === 0 ? (
                            <div className="text-center py-4 text-secondary">
                                No hay tareas recientes
                            </div>
                        ) : (
                            recentTasks.map((task) => (
                                <div key={task.id} className="task-item">
                                    <div className="task-info">
                                        <div className="task-title">{task.nombre}</div>
                                        <div className="text-sm text-tertiary flex items-center gap-1">
                                            <MapPin size={12} />
                                            {getClientName(task.clientId)} - {getClientAddress(task.clientId)}
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
