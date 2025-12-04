import api from './api';
import type { Role } from '../types';

interface ApiRole {
    id_rol?: number;
    nombre: string;
}

const mapToRole = (data: any): Role => {
    const id = String(data.idRol || data.id_rol || data.id || '');

    const role: Role = {
        id,
        name: data.nombre || '',
    };

    return role;
};

const mapToApi = (data: Partial<Role>): Partial<ApiRole> => ({
    nombre: data.name,
});

export const roleService = {
    getAll: async (): Promise<Role[]> => {
        const response = await api.get('/roles');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.roles || []);
        return data.map(mapToRole);
    },

    getById: async (id: string): Promise<Role> => {
        const response = await api.get(`/roles/${id}`);
        return mapToRole(response.data);
    },

    create: async (role: Omit<Role, 'id'>): Promise<Role> => {
        const payload = mapToApi(role);
        const response = await api.post('/roles', payload);
        return mapToRole(response.data);
    },

    update: async (id: string, role: Partial<Role>): Promise<Role> => {
        const payload = mapToApi(role);
        const response = await api.put(`/roles/${id}`, payload);
        return mapToRole(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/roles/${id}`);
    },
};
