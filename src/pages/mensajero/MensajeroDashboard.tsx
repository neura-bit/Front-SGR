import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Package, CheckCircle, Clock, MapPin } from 'lucide-react';

export const MensajeroDashboard: React.FC = () => {
    const { user } = useAuth();
    const { tasks, clients, taskStatuses } = useData();

    // Get client name and address
    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Sin cliente';
    };

    const getClientAddress = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.address || 'Sin dirección';
    };

    // Get task status name
    const getTaskStatusName = (taskStatusId: string) => {
        const status = taskStatuses.find(s => s.id === taskStatusId);
        return status?.name || 'N/A';
    };

    // My tasks - assigned to current user
    const myTasks = tasks.filter(t => t.assignedCourierId === user?.id);

    // Today's tasks (based on fechaLimite)
    const todayTasks = myTasks.filter(t => {
        const taskDate = new Date(t.fechaLimite);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString();
    });

    // In progress (proceso = true and no fechaFin)
    const inProgress = myTasks.filter(t => t.proceso && !t.fechaFin).length;

    // Completed (has fechaFin)
    const completed = myTasks.filter(t => t.fechaFin).length;

    return (
        <div className="animate-fade-in">
            <div className="mb-lg">
                <h1>Mis Tareas</h1>
                <p className="text-secondary">Vista de tus tareas asignadas</p>
            </div>

            <div className="grid grid-cols-3">
                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-primary">
                            <Package size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{todayTasks.length}</div>
                            <div className="stat-label">Tareas Hoy</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-info">
                            <Clock size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{inProgress}</div>
                            <div className="stat-label">En Progreso</div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-md mb-md">
                        <div className="stat-icon stat-success">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{completed}</div>
                            <div className="stat-label">Completadas</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-lg">
                <Card>
                    <CardHeader title="Tareas de Hoy" subtitle={`${todayTasks.length} tareas programadas`} />
                    <div className="task-list">
                        {todayTasks.length > 0 ? (
                            todayTasks.map((task) => (
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
                        ) : (
                            <p className="text-tertiary text-center">No tienes tareas asignadas para hoy</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
