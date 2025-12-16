import api from './api';
import type { Client } from '../types';

interface ApiClient {
    id_cliente?: number;
    nombre: string;
    telefono: string;
    rucCi: string;
    direccion: string;
    ciudad: string;
    detalle?: string;
    latitud?: number;
    longitud?: number;
}

const mapToClient = (data: any): Client => {
    const id = String(data.id_cliente || data.idCliente || data.id || data._id || '');

    const client: Client = {
        id,
        name: data.nombre || '',
        phone: data.telefono || '',
        rucCi: data.rucCi || '',
        address: data.direccion || '',
        city: data.ciudad || '',
        detalle: data.detalle || '',
        latitude: data.latitud,
        longitude: data.longitud,
    };

    return client;
};

const mapToApi = (data: Partial<Client>): Partial<ApiClient> => ({
    nombre: data.name,
    telefono: data.phone,
    rucCi: data.rucCi,
    direccion: data.address,
    ciudad: data.city,
    detalle: data.detalle,
    latitud: data.latitude,
    longitud: data.longitude,
});

export const clientService = {
    getAll: async (): Promise<Client[]> => {
        const response = await api.get('/clientes');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.clientes || []);
        return data.map(mapToClient);
    },

    getById: async (id: string): Promise<Client> => {
        const response = await api.get(`/clientes/${id}`);
        return mapToClient(response.data);
    },

    create: async (client: Omit<Client, 'id'>): Promise<Client> => {
        const payload = mapToApi(client);
        const response = await api.post('/clientes', payload);
        return mapToClient(response.data);
    },

    update: async (id: string, client: Partial<Client>): Promise<Client> => {
        const payload = mapToApi(client);
        const response = await api.put(`/clientes/${id}`, payload);
        return mapToClient(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/clientes/${id}`);
    },
};
