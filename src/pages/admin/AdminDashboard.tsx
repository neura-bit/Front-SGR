import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
    const { getDashboardStats, tasks, users } = useData();
    const stats = getDashboardStats();

    const couriers = users.filter((u) => u.role === 'MENSAJERO' && u.active);
    const recentTasks = tasks.slice(0, 5);

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
                    <CardHeader title="Tareas Recientes" subtitle="Últimas tareas registradas  en el sistema" />
                    <div className="task-list">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <div key={task.id} className="task-item">
                                    <div className="task-info">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-address text-sm text-tertiary">
                                            {task.deliveryAddress}
                                        </div>
                                    </div>
                                    <div className={`task-status status-${task.status}`}>
                                        {task.status}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-tertiary text-center">No hay tareas registradas</p>
                        )}
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Mensajeros" subtitle={`${couriers.length} mensajeros activos`} />
                    <div className="courier-list">
                        {couriers.map((courier) => (
                            <div key={courier.id} className="courier-item">
                                <div className="courier-avatar">
                                    {courier.name.charAt(0)}
                                </div>
                                <div className="courier-info">
                                    <div className="courier-name">{courier.name}</div>
                                    <div className="courier-email text-xs text-tertiary">{courier.email}</div>
                                </div>
                                <div className="courier-status">
                                    <div className="status-dot"></div>
                                    Activo
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
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
