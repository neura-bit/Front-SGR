import api from './api';
import type { User } from '../types';

interface ApiUser {
    idUsuario?: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    username: string;
    password?: string;
    estado: boolean;
    sucursal: {
        idSucursal: number;
    };
    rol: {
        id_rol: number;  // Backend expects snake_case
    };
}

const mapToUser = (data: any): User => {
    const id = String(data.idUsuario || data.id_usuario || data.id || '');

    const user: User = {
        id,
        firstName: data.nombre || '',
        lastName: data.apellido || '',
        phone: data.telefono || '',
        username: data.username || '',
        active: data.estado !== undefined ? data.estado : true,
        branchId: String(data.sucursal?.idSucursal || data.idSucursal || ''),
        roleId: String(data.rol?.id_rol || data.rol?.idRol || data.idRol || ''),
        // Computed fields
        name: `${data.nombre || ''} ${data.apellido || ''}`.trim(),
    };

    return user;
};

const mapToApi = (data: Partial<User>): Partial<ApiUser> => {
    const payload: Partial<ApiUser> = {
        nombre: data.firstName,
        apellido: data.lastName,
        telefono: data.phone,
        username: data.username,
        estado: data.active,
    };

    // Only include password if it's provided (for create or update)
    if (data.password) {
        payload.password = data.password;
    }

    // Add branch and role if provided
    if (data.branchId) {
        payload.sucursal = {
            idSucursal: parseInt(data.branchId),
        };
    }

    if (data.roleId) {
        payload.rol = {
            id_rol: parseInt(data.roleId),  // Backend expects snake_case
        };
    }

    return payload;
};

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/usuarios');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.usuarios || []);
        return data.map(mapToUser);
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/usuarios/${id}`);
        return mapToUser(response.data);
    },

    create: async (user: Omit<User, 'id'>): Promise<User> => {
        const payload = mapToApi(user);
        const response = await api.post('/usuarios', payload);
        return mapToUser(response.data);
    },

    update: async (id: string, user: Partial<User>): Promise<User> => {
        const payload = mapToApi(user);
        const response = await api.put(`/usuarios/${id}`, payload);
        return mapToUser(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/usuarios/${id}`);
    },
};
