import React, { useState, useEffect, useCallback } from 'react';
import { GoogleTrackingMap } from '../../components/map/GoogleTrackingMap';
import type { CourierMarker } from '../../components/map/GoogleTrackingMap';
import { trackingService } from '../../services/trackingService';
import type { CourierPosition } from '../../services/trackingService';
import { MapPin, Users as UsersIcon, Navigation, RefreshCw, AlertCircle } from 'lucide-react';
import './Tracking.css';

const REFRESH_INTERVAL = 10000; // 10 seconds

export const Tracking: React.FC = () => {
    const [couriers, setCouriers] = useState<CourierPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);

    const fetchCouriers = useCallback(async () => {
        try {
            setError(null);
            const data = await trackingService.getCurrentPositions();

            // Filter to show only today's locations
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todaysCouriers = data.filter(courier => {
                const lastUpdateDate = new Date(courier.lastUpdate);
                lastUpdateDate.setHours(0, 0, 0, 0);
                return lastUpdateDate.getTime() >= today.getTime();
            });

            setCouriers(todaysCouriers);
            setLastRefresh(new Date());
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al cargar ubicaciones';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load and auto-refresh
    useEffect(() => {
        fetchCouriers();

        const interval = setInterval(fetchCouriers, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchCouriers]);

    // Convert couriers to markers format for GoogleTrackingMap
    const courierMarkers: CourierMarker[] = couriers.map(courier => ({
        id: courier.id,
        name: courier.name,
        latitude: courier.latitude,
        longitude: courier.longitude,
        currentTaskName: courier.currentTaskName,
        lastUpdate: courier.lastUpdate,
    }));

    const handleCourierClick = (courier: CourierMarker) => {
        setSelectedCourierId(courier.id);
    };

    return (
        <div className="tracking-page">
            <div className="tracking-header">
                <div>
                    <h1 className="tracking-title">Seguimiento en Vivo</h1>
                    <p className="tracking-subtitle">Monitorea la ubicación de los mensajeros en tiempo real</p>
                </div>

                <div className="tracking-stats">
                    <div className="stat-card">
                        <UsersIcon size={24} className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{couriers.length}</span>
                            <span className="stat-label">Mensajeros Activos</span>
                        </div>
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={fetchCouriers}
                        disabled={isLoading}
                        title="Actualizar ahora"
                    >
                        <RefreshCw size={20} className={isLoading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="tracking-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="tracking-content">
                <div className="tracking-sidebar">
                    <div className="sidebar-section">
                        <div className="sidebar-header">
                            <h3 className="sidebar-title">Mensajeros ({couriers.length})</h3>
                            {lastRefresh && (
                                <span className="last-refresh">
                                    Actualizado: {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        <div className="courier-list">
                            {isLoading && couriers.length === 0 ? (
                                <div className="loading-state">
                                    <RefreshCw size={32} className="spinning" />
                                    <p>Cargando mensajeros...</p>
                                </div>
                            ) : couriers.length === 0 ? (
                                <div className="empty-state">
                                    <MapPin size={48} />
                                    <p>No hay mensajeros activos en este momento</p>
                                </div>
                            ) : (
                                couriers.map(courier => (
                                    <div
                                        key={courier.id}
                                        className={`courier-card ${selectedCourierId === courier.id ? 'courier-card-selected' : ''}`}
                                        onClick={() => setSelectedCourierId(courier.id)}
                                    >
                                        <div className="courier-card-header">
                                            <div className="courier-avatar">
                                                {courier.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="courier-info">
                                                <h4 className="courier-name">{courier.name}</h4>
                                                {courier.currentTaskName && (
                                                    <span className="courier-task">{courier.currentTaskName}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="courier-card-footer">
                                            <span className="courier-status">
                                                <Navigation size={12} />
                                                {courier.currentTaskName ? 'En tarea' : 'Disponible'}
                                            </span>
                                            <span className="courier-time">
                                                {courier.lastUpdate.toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="tracking-map">
                    <GoogleTrackingMap
                        couriers={courierMarkers}
                        height="calc(100vh - 200px)"
                        selectedCourierId={selectedCourierId}
                        onCourierClick={handleCourierClick}
                    />
                </div>
            </div>
        </div>
    );
};

