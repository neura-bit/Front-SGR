import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Package, CheckCircle } from 'lucide-react';
import { TaskStatusBadge } from '../../components/TaskStatusBadge';

export const AsesorDashboard: React.FC = () => {
    const { tasks } = useData();
    const recentTasks = tasks.slice(0, 10);

    return (
        <div className="animate-fade-in">
            <div className="mb-lg">
                <h1>Dashboard del Asesor</h1>
                <p className="text-secondary">Gestión de tareas y asignaciones</p>
            </div>

            <div className="grid grid-cols-2">
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
                        <div className="stat-icon stat-success">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <div className="stat-value">{tasks.filter(t => t.status === 'completed').length}</div>
                            <div className="stat-label">Completadas</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-lg">
                <Card>
                    <CardHeader title="Tareas Recientes" />
                    <div className="task-list">
                        {recentTasks.map((task) => (
                            <div key={task.id} className="task-item">
                                <div className="task-info">
                                    <div className="task-title">{task.title}</div>
                                    <div className="text-sm text-tertiary">{task.deliveryAddress}</div>
                                </div>
                                <TaskStatusBadge status={task.status} />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
