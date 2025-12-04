import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { TaskStatusBadge } from '../../components/TaskStatusBadge';

export const MensajeroDashboard: React.FC = () => {
    const { user } = useAuth();
    const { tasks } = useData();

    const myTasks = tasks.filter(t => t.assignedTo === user?.id);
    const todayTasks = myTasks.filter(t => {
        const taskDate = new Date(t.scheduledDate);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString();
    });
    const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
    const completed = myTasks.filter(t => t.status === 'completed').length;

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
                                        <div className="task-title">{task.title}</div>
                                        <div className="text-sm text-tertiary">{task.deliveryAddress}</div>
                                    </div>
                                    <TaskStatusBadge status={task.status} />
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
