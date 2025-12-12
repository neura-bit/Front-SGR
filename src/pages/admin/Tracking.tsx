import React, { useState, useEffect, useCallback } from 'react';
import { Map } from '../../components/map/Map';
import type { MapMarker } from '../../components/map/Map';
import { trackingService } from '../../services/trackingService';
import type { CourierPosition } from '../../services/trackingService';
import { MapPin, Users as UsersIcon, Navigation, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import './Tracking.css';

const REFRESH_INTERVAL = 10000; // 10 seconds

export const Tracking: React.FC = () => {
    const [couriers, setCouriers] = useState<CourierPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchCouriers = useCallback(async () => {
        try {
            setError(null);
            const data = await trackingService.getCurrentPositions();
            setCouriers(data);
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

    // Create markers for map
    const markers: MapMarker[] = couriers.map(courier => ({
        id: courier.id,
        position: [courier.latitude, courier.longitude],
        popup: (
            <div className="courier-popup">
                <div className="courier-popup-header">
                    <MapPin size={16} className="courier-popup-icon" />
                    <h4>{courier.name}</h4>
                </div>
                <div className="courier-popup-info">
                    {courier.currentTaskName && (
                        <p><strong>Tarea:</strong> {courier.currentTaskName}</p>
                    )}
                    <p className="courier-popup-time">
                        <Clock size={12} />
                        Última actualización: {courier.lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        ),
    }));

    // Calculate center of map (average of all courier locations or Quito default)
    const mapCenter = markers.length > 0
        ? [
            markers.reduce((sum, m) => sum + (m.position as [number, number])[0], 0) / markers.length,
            markers.reduce((sum, m) => sum + (m.position as [number, number])[1], 0) / markers.length,
        ] as [number, number]
        : [-0.1937, -78.4920] as [number, number]; // Quito default

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
                                    <div key={courier.id} className="courier-card">
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
                    <Map
                        center={mapCenter}
                        zoom={14}
                        markers={markers}
                        height="calc(100vh - 200px)"
                    />
                </div>
            </div>
        </div>
    );
};
