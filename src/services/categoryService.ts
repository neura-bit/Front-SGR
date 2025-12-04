import api from './api';
import type { Category } from '../types';

interface ApiCategory {
    id_categoria?: number;
    nombre: string;
}

const mapToCategory = (data: any): Category => {
    const id = String(data.id_categoria || data.idCategoria || data.id || data._id || '');

    const category: Category = {
        id,
        name: data.nombre || '',
        description: data.descripcion || data.description || '',
        color: data.color || '#6b7280',
    };

    return category;
};

const mapToApi = (data: Partial<Category>): Partial<ApiCategory> => ({
    nombre: data.name,
});

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await api.get('/categorias');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.categorias || []);
        return data.map(mapToCategory);
    },

    getById: async (id: string): Promise<Category> => {
        const response = await api.get(`/categorias/${id}`);
        return mapToCategory(response.data);
    },

    create: async (category: Omit<Category, 'id'>): Promise<Category> => {
        const payload = mapToApi(category);
        const response = await api.post('/categorias', payload);
        return mapToCategory(response.data);
    },

    update: async (id: string, category: Partial<Category>): Promise<Category> => {
        const payload = mapToApi(category);
        const response = await api.put(`/categorias/${id}`, payload);
        return mapToCategory(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/categorias/${id}`);
    },
};
