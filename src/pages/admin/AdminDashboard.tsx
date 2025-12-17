import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { CourierTasksPanel } from '../../components/shared/CourierTasksPanel';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
    const { getDashboardStats, tasks, clients, taskStatuses } = useData();
    const stats = getDashboardStats();

    const recentTasks = tasks.slice(0, 5);

    // Helper functions
    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Sin cliente';
    };

    const getClientAddress = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.address || 'Sin dirección';
    };

    const getTaskStatusName = (taskStatusId: string) => {
        const status = taskStatuses.find(s => s.id === taskStatusId);
        return status?.name || 'N/A';
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Dashboard Administrativo</h1>
                <p className="text-secondary">Vista general del sistema de gestión de rutas</p>
            </div>

            <div className="grid grid-cols-4 stats-grid">
                <Card className="stat-card">
                    <div className="stat-icon stat-primary">
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalTasks}</div>
                        <div className="stat-label">Total Tareas</div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon stat-info">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeTasks}</div>
                        <div className="stat-label">Tareas Activas</div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon stat-success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.completedToday}</div>
                        <div className="stat-label">Completadas Hoy</div>
                    </div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-icon stat-warning">
                        <Truck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeCouriers}</div>
                        <div className="stat-label">Mensajeros Activos</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-2 mt-lg">
                <Card>
                    <CardHeader title="Tareas Recientes" subtitle="Últimas tareas registradas en el sistema" />
                    <div className="task-list">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <div key={task.id} className="task-item">
                                    <div className="task-info">
                                        <div className="task-title">{task.nombre}</div>
                                        <div className="task-address text-sm text-tertiary flex items-center gap-1">
                                            <MapPin size={12} />
                                            {getClientName(task.clientId)} - {getClientAddress(task.clientId)}
                                        </div>
                                    </div>
                                    <div className={`task-status status-${task.fechaFin ? 'completed' : task.proceso ? 'in_progress' : 'pending'}`}>
                                        {getTaskStatusName(task.taskStatusId)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-tertiary text-center">No hay tareas registradas</p>
                        )}
                    </div>
                </Card>

                {/* Courier Tasks Panel */}
                <CourierTasksPanel />
            </div>

            <div className="mt-lg">
                <Card>
                    <CardHeader
                        title="Acceso Rápido"
                        subtitle="Gestión de módulos del sistema"
                    />
                    <div className="quick-actions">
                        <a href="/admin/tasks" className="quick-action-card">
                            <Package size={32} />
                            <h3>Gestionar Tareas</h3>
                            <p>Crear y administrar tareas</p>
                        </a>
                        <a href="/admin/users" className="quick-action-card">
                            <Truck size={32} />
                            <h3>Gestionar Usuarios</h3>
                            <p>Administrar usuarios del sistema</p>
                        </a>
                        <a href="/admin/tracking" className="quick-action-card">
                            <Clock size={32} />
                            <h3>Seguimiento en Vivo</h3>
                            <p>Ver ubicación de mensajeros</p>
                        </a>
                        <a href="/admin/performance" className="quick-action-card">
                            <CheckCircle size={32} />
                            <h3>Rendimiento</h3>
                            <p>Análisis y métricas</p>
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
};
