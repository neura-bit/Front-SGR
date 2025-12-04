import api from './api';
import type { Branch } from '../types';

interface ApiBranch {
    id_sucursal?: number;
    nombre: string;
    direccion: string;
    ciudad: string;
    telefono: string;
}

const mapToBranch = (data: any): Branch => {
    const id = String(data.idSucursal || data.id_sucursal || data.id || '');

    const branch: Branch = {
        id,
        name: data.nombre || '',
        address: data.direccion || '',
        city: data.ciudad || '',
        phone: data.telefono || '',
    };

    return branch;
};

const mapToApi = (data: Partial<Branch>): Partial<ApiBranch> => ({
    nombre: data.name,
    direccion: data.address,
    ciudad: data.city,
    telefono: data.phone,
});

export const branchService = {
    getAll: async (): Promise<Branch[]> => {
        const response = await api.get('/sucursales');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.sucursales || []);
        return data.map(mapToBranch);
    },

    getById: async (id: string): Promise<Branch> => {
        const response = await api.get(`/sucursales/${id}`);
        return mapToBranch(response.data);
    },

    create: async (branch: Omit<Branch, 'id'>): Promise<Branch> => {
        const payload = mapToApi(branch);
        const response = await api.post('/sucursales', payload);
        return mapToBranch(response.data);
    },

    update: async (id: string, branch: Partial<Branch>): Promise<Branch> => {
        const payload = mapToApi(branch);
        const response = await api.put(`/sucursales/${id}`, payload);
        return mapToBranch(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/sucursales/${id}`);
    },
};
