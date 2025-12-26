import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { metricsService } from '../../../services/metricsService';
import type { MensajeroMetrics } from '../../../services/metricsService';
import { userService } from '../../../services/userService';
import type { User } from '../../../types';
import {
    BarChart3,
    Clock,
    CheckCircle2,
    TrendingUp,
    Users,
    Search,
    AlertCircle,
} from 'lucide-react';
import './PerformanceDashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export const PerformanceDashboard: React.FC = () => {
    // State for filters
    const [fechaInicio, setFechaInicio] = useState<string>(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });
    const [selectedMensajero, setSelectedMensajero] = useState<string>('all');

    // State for data
    const [mensajeros, setMensajeros] = useState<User[]>([]);
    const [metricsData, setMetricsData] = useState<MensajeroMetrics[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Load messengers on mount
    useEffect(() => {
        const loadMensajeros = async () => {
            try {
                const users = await userService.getAll();
                const messengerUsers = users.filter(u => u.role === 'MENSAJERO');
                setMensajeros(messengerUsers);
            } catch (err) {
                console.error('Error loading messengers:', err);
            }
        };
        loadMensajeros();
    }, []);

    // Load metrics
    const loadMetrics = async () => {
        setLoading(true);
        setError(null);
        try {
            if (selectedMensajero === 'all') {
                const data = await metricsService.getComparativeMetrics(fechaInicio, fechaFin);
                setMetricsData(data);
            } else {
                const data = await metricsService.getMensajeroMetrics(
                    parseInt(selectedMensajero),
                    fechaInicio,
                    fechaFin
                );
                setMetricsData([data]);
            }
        } catch (err: any) {
            console.error('Error loading metrics:', err);
            setError(err.response?.data?.message || 'Error al cargar las métricas');
            setMetricsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadMetrics();
    }, []);

    // Aggregated metrics for KPIs
    const aggregatedMetrics = useMemo(() => {
        if (metricsData.length === 0) {
            return {
                totalTareasAsignadas: 0,
                porcentajeCumplimiento: 0,
                tiempoPromedioRespuesta: 0,
                tiempoPromedioEjecucion: 0,
                entregasATiempo: 0,
                entregasTardias: 0,
                tareasCompletadas: 0,
                tareasPendientes: 0,
                tareasEnProceso: 0,
            };
        }

        const totals = metricsData.reduce(
            (acc, m) => ({
                totalTareasAsignadas: acc.totalTareasAsignadas + (m.totalTareasAsignadas || 0),
                entregasATiempo: acc.entregasATiempo + (m.entregasATiempo || 0),
                entregasTardias: acc.entregasTardias + (m.entregasTardias || 0),
                tareasCompletadas: acc.tareasCompletadas + (m.tareasCompletadas || 0),
                tareasPendientes: acc.tareasPendientes + (m.tareasPendientes || 0),
                tareasEnProceso: acc.tareasEnProceso + (m.tareasEnProceso || 0),
                tiempoRespuestaSum: acc.tiempoRespuestaSum + (m.tiempoPromedioRespuesta || 0),
                tiempoEjecucionSum: acc.tiempoEjecucionSum + (m.tiempoPromedioEjecucion || 0),
            }),
            {
                totalTareasAsignadas: 0,
                entregasATiempo: 0,
                entregasTardias: 0,
                tareasCompletadas: 0,
                tareasPendientes: 0,
                tareasEnProceso: 0,
                tiempoRespuestaSum: 0,
                tiempoEjecucionSum: 0,
            }
        );

        const totalEntregas = totals.entregasATiempo + totals.entregasTardias;
        const porcentajeCumplimiento = totalEntregas > 0
            ? (totals.entregasATiempo / totalEntregas) * 100
            : 0;

        return {
            totalTareasAsignadas: totals.totalTareasAsignadas,
            porcentajeCumplimiento: porcentajeCumplimiento,
            tiempoPromedioRespuesta: totals.tiempoRespuestaSum / metricsData.length,
            tiempoPromedioEjecucion: totals.tiempoEjecucionSum / metricsData.length,
            entregasATiempo: totals.entregasATiempo,
            entregasTardias: totals.entregasTardias,
            tareasCompletadas: totals.tareasCompletadas,
            tareasPendientes: totals.tareasPendientes,
            tareasEnProceso: totals.tareasEnProceso,
        };
    }, [metricsData]);

    // Chart data: Doughnut for on-time vs late deliveries
    const doughnutData = {
        labels: ['A Tiempo', 'Tardías'],
        datasets: [
            {
                data: [aggregatedMetrics.entregasATiempo, aggregatedMetrics.entregasTardias],
                backgroundColor: ['#059669', '#dc2626'],
                borderColor: ['#047857', '#b91c1c'],
                borderWidth: 2,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                },
            },
        },
    };

    // Chart data: Bar for task status
    const statusBarData = {
        labels: ['Completadas', 'Pendientes', 'En Proceso'],
        datasets: [
            {
                label: 'Tareas',
                data: [
                    aggregatedMetrics.tareasCompletadas,
                    aggregatedMetrics.tareasPendientes,
                    aggregatedMetrics.tareasEnProceso,
                ],
                backgroundColor: ['#059669', '#d97706', '#2563eb'],
                borderRadius: 8,
            },
        ],
    };

    const statusBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Chart data: Horizontal bar for comparison
    const sortedMensajeros = useMemo(() => {
        return [...metricsData].sort((a, b) => (b.porcentajeCumplimiento ?? 0) - (a.porcentajeCumplimiento ?? 0));
    }, [metricsData]);

    const comparisonBarData = {
        labels: sortedMensajeros.map(m => m.nombreMensajero || 'Sin nombre'),
        datasets: [
            {
                label: '% Cumplimiento',
                data: sortedMensajeros.map(m => m.porcentajeCumplimiento ?? 0),
                backgroundColor: sortedMensajeros.map(m => {
                    const pct = m.porcentajeCumplimiento ?? 0;
                    if (pct >= 85) return '#059669';
                    if (pct >= 60) return '#d97706';
                    return '#dc2626';
                }),
                borderRadius: 8,
            },
        ],
    };

    const comparisonBarOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
            },
            y: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Get performance level class
    const getPerformanceClass = (percentage: number | null | undefined): string => {
        const pct = percentage ?? 0;
        if (pct >= 85) return 'performance-high';
        if (pct >= 60) return 'performance-medium';
        return 'performance-low';
    };

    // Format time
    const formatTime = (minutes: number | null | undefined): string => {
        if (minutes === null || minutes === undefined || isNaN(minutes)) {
            return 'N/A';
        }
        if (minutes < 60) return `${minutes.toFixed(1)} min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="performance-dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Análisis de Rendimiento</h1>
                <p className="text-secondary">Métricas de rendimiento de mensajeros</p>
            </div>

            {/* Filters */}
            <Card className="filters-card">
                <div className="filters-container">
                    <div className="filter-group">
                        <label>Fecha Inicio</label>
                        <Input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Fecha Fin</label>
                        <Input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Mensajero</label>
                        <select
                            className="filter-select"
                            value={selectedMensajero}
                            onChange={(e) => setSelectedMensajero(e.target.value)}
                        >
                            <option value="all">Todos los mensajeros</option>
                            {mensajeros.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        onClick={loadMetrics}
                        disabled={loading}
                        className="search-button"
                    >
                        <Search size={18} />
                        {loading ? 'Cargando...' : 'Buscar'}
                    </Button>
                </div>
            </Card>

            {/* Error message */}
            {error && (
                <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-4 kpi-grid">
                <Card className="kpi-card">
                    <div className="kpi-icon kpi-primary">
                        <BarChart3 size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{aggregatedMetrics.totalTareasAsignadas}</div>
                        <div className="kpi-label">Total Tareas Asignadas</div>
                    </div>
                </Card>

                <Card className="kpi-card">
                    <div className={`kpi-icon ${getPerformanceClass(aggregatedMetrics.porcentajeCumplimiento)}`}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{aggregatedMetrics.porcentajeCumplimiento.toFixed(1)}%</div>
                        <div className="kpi-label">% Cumplimiento</div>
                    </div>
                </Card>

                <Card className="kpi-card">
                    <div className="kpi-icon kpi-info">
                        <Clock size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatTime(aggregatedMetrics.tiempoPromedioRespuesta)}</div>
                        <div className="kpi-label">Tiempo Promedio Respuesta</div>
                    </div>
                </Card>

                <Card className="kpi-card">
                    <div className="kpi-icon kpi-warning">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatTime(aggregatedMetrics.tiempoPromedioEjecucion)}</div>
                        <div className="kpi-label">Tiempo Promedio Ejecución</div>
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 charts-grid mt-lg">
                <Card>
                    <CardHeader title="Entregas a Tiempo vs Tardías" subtitle="Distribución de entregas" />
                    <div className="chart-container doughnut-container">
                        {aggregatedMetrics.entregasATiempo > 0 || aggregatedMetrics.entregasTardias > 0 ? (
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        ) : (
                            <div className="no-data">
                                <AlertCircle size={48} />
                                <p>Sin datos disponibles</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <CardHeader title="Estado de Tareas" subtitle="Distribución por estado" />
                    <div className="chart-container">
                        <Bar data={statusBarData} options={statusBarOptions} />
                    </div>
                </Card>
            </div>

            {/* Comparison Chart */}
            {metricsData.length > 1 && (
                <Card className="mt-lg">
                    <CardHeader
                        title="Comparativo de Rendimiento"
                        subtitle="Ranking de mensajeros por % de cumplimiento"
                    />
                    <div className="chart-container comparison-container">
                        <Bar data={comparisonBarData} options={comparisonBarOptions} />
                    </div>
                </Card>
            )}

            {/* Ranking Table */}
            <Card className="mt-lg">
                <CardHeader
                    title="Ranking de Mensajeros"
                    subtitle="Ordenados por porcentaje de cumplimiento"
                />
                <div className="ranking-table-container">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mensajero</th>
                                <th>Tareas Completadas</th>
                                <th>% Cumplimiento</th>
                                <th>Tiempo Promedio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMensajeros.length > 0 ? (
                                sortedMensajeros.map((m, index) => (
                                    <tr key={m.idMensajero}>
                                        <td className="rank-cell">{index + 1}</td>
                                        <td className="name-cell">
                                            <div className="mensajero-avatar">
                                                <Users size={16} />
                                            </div>
                                            {m.nombreMensajero || 'Sin nombre'}
                                        </td>
                                        <td>{m.tareasCompletadas ?? 0} / {m.totalTareasAsignadas ?? 0}</td>
                                        <td>
                                            <div className={`performance-badge ${getPerformanceClass(m.porcentajeCumplimiento)}`}>
                                                {(m.porcentajeCumplimiento ?? 0).toFixed(1)}%
                                            </div>
                                        </td>
                                        <td>{formatTime(m.tiempoPromedioTotal)}</td>
                                        <td>
                                            <span className={`status-indicator ${getPerformanceClass(m.porcentajeCumplimiento)}`}>
                                                {(m.porcentajeCumplimiento ?? 0) >= 85
                                                    ? 'Excelente'
                                                    : (m.porcentajeCumplimiento ?? 0) >= 60
                                                        ? 'Regular'
                                                        : 'Bajo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="no-data-cell">
                                        {loading ? 'Cargando datos...' : 'No hay datos disponibles'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
