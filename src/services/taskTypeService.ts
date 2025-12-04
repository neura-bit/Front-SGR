import api from './api';
import type { TaskType } from '../types';

interface ApiTaskType {
    id_tipo_operacion?: number;
    nombre: string;
}

const mapToTaskType = (data: any): TaskType => {
    const id = String(data.id_tipo_operacion || data.idTipoOperacion || data.id || data._id || '');

    const taskType: TaskType = {
        id,
        name: data.nombre || '',
        description: data.descripcion || data.description || '',
        code: (data.codigo || data.code || 'entrega') as 'entrega' | 'retiro',
        active: data.activo !== undefined ? data.activo : true,
    };

    return taskType;
};

const mapToApi = (data: Partial<TaskType>): Partial<ApiTaskType> => ({
    nombre: data.name,
});

export const taskTypeService = {
    getAll: async (): Promise<TaskType[]> => {
        const response = await api.get('/tipo-operaciones');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.tipoOperaciones || []);
        return data.map(mapToTaskType);
    },

    getById: async (id: string): Promise<TaskType> => {
        const response = await api.get(`/tipo-operaciones/${id}`);
        return mapToTaskType(response.data);
    },

    create: async (taskType: Omit<TaskType, 'id'>): Promise<TaskType> => {
        const payload = mapToApi(taskType);
        const response = await api.post('/tipo-operaciones', payload);
        return mapToTaskType(response.data);
    },

    update: async (id: string, taskType: Partial<TaskType>): Promise<TaskType> => {
        const payload = mapToApi(taskType);
        const response = await api.put(`/tipo-operaciones/${id}`, payload);
        return mapToTaskType(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tipo-operaciones/${id}`);
    },
};
