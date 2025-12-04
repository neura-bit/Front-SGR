import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Users, Package } from 'lucide-react';
import { TaskStatusBadge } from '../../components/TaskStatusBadge';

export const SupervisorDashboard: React.FC = () => {
    const { tasks, users } = useData();
    const couriers = users.filter((u) => u.role === 'MENSAJERO');
    const activeTasks = tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress');

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
                        {activeTasks.slice(0, 10).map((task) => (
                            <div key={task.id} className="task-item">
                                <div className="task-info">
                                    <div className="task-title">{task.title}</div>
                                    <div className="text-sm text-tertiary">
                                        {task.assignedTo ? `Asignado a: ${users.find(u => u.id === task.assignedTo)?.name}` : 'Sin asignar'}
                                    </div>
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
