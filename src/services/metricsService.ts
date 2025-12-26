import api from './api';

// Types for metrics responses
export interface MensajeroMetrics {
    idMensajero: number;
    nombreMensajero: string;
    fechaInicio: string;
    fechaFin: string;
    totalTareasAsignadas: number;
    tareasCompletadas: number;
    tareasPendientes: number;
    tareasEnProceso: number;
    entregasATiempo: number;
    entregasTardias: number;
    porcentajeCumplimiento: number;
    porcentajeCompletado: number;
    tiempoPromedioRespuesta: number; // in minutes
    tiempoPromedioEjecucion: number; // in minutes
    tiempoPromedioTotal: number; // in minutes
}

export interface DailyMetrics extends MensajeroMetrics {
    fecha: string;
}

export interface ComparativeMetrics {
    fechaInicio: string;
    fechaFin: string;
    mensajeros: MensajeroMetrics[];
}

export const metricsService = {
    /**
     * Get metrics for a specific messenger within a date range
     */
    getMensajeroMetrics: async (
        idMensajero: number,
        fechaInicio: string,
        fechaFin: string
    ): Promise<MensajeroMetrics> => {
        const response = await api.get(
            `/metricas/mensajeros/${idMensajero}`,
            {
                params: { fechaInicio, fechaFin }
            }
        );
        return response.data;
    },

    /**
     * Get daily summary for a specific messenger
     */
    getDailyMetrics: async (
        idMensajero: number,
        fecha: string
    ): Promise<DailyMetrics> => {
        const response = await api.get(
            `/metricas/mensajeros/${idMensajero}/dia/${fecha}`
        );
        return response.data;
    },

    /**
     * Get comparative/ranking metrics for all messengers
     */
    getComparativeMetrics: async (
        fechaInicio: string,
        fechaFin: string
    ): Promise<MensajeroMetrics[]> => {
        const response = await api.get(
            `/metricas/mensajeros/comparativo`,
            {
                params: { fechaInicio, fechaFin }
            }
        );
        // The API might return wrapped data or direct array
        return Array.isArray(response.data)
            ? response.data
            : (response.data.mensajeros || response.data.data || []);
    },
};
