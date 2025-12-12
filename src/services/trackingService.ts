import api from './api';

export interface CourierTrackingData {
    idMensajero: number;
    nombreCompleto: string;
    idTareaActual: number | null;
    nombreTareaActual: string | null;
    latitud: number;
    longitud: number;
    fechaUltimaActualizacion: string;
}

export interface CourierPosition {
    id: string;
    name: string;
    currentTaskId: string | null;
    currentTaskName: string | null;
    latitude: number;
    longitude: number;
    lastUpdate: Date;
}

const mapToCourierPosition = (data: CourierTrackingData): CourierPosition => ({
    id: String(data.idMensajero),
    name: data.nombreCompleto,
    currentTaskId: data.idTareaActual ? String(data.idTareaActual) : null,
    currentTaskName: data.nombreTareaActual,
    latitude: data.latitud,
    longitude: data.longitud,
    lastUpdate: new Date(data.fechaUltimaActualizacion),
});

export const trackingService = {
    getCurrentPositions: async (): Promise<CourierPosition[]> => {
        const response = await api.get<CourierTrackingData[]>('/tracking/mensajeros-actual');
        return response.data.map(mapToCourierPosition);
    },
};
