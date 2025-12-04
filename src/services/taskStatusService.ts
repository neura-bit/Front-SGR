import api from './api';
import type { TaskStatusEntity } from '../types';

interface ApiTaskStatus {
    id_estado_tarea?: number;
    nombre: string;
}

const mapToTaskStatus = (data: any): TaskStatusEntity => {
    const id = String(data.id_estado_tarea || data.idEstadoTarea || data.id || data._id || '');

    const taskStatus: TaskStatusEntity = {
        id,
        name: data.nombre || '',
    };

    return taskStatus;
};

const mapToApi = (data: Partial<TaskStatusEntity>): Partial<ApiTaskStatus> => ({
    nombre: data.name,
});

export const taskStatusService = {
    getAll: async (): Promise<TaskStatusEntity[]> => {
        const response = await api.get('/estado-tareas');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.estadosTarea || []);
        return data.map(mapToTaskStatus);
    },

    getById: async (id: string): Promise<TaskStatusEntity> => {
        const response = await api.get(`/estado-tareas/${id}`);
        return mapToTaskStatus(response.data);
    },

    create: async (status: Omit<TaskStatusEntity, 'id'>): Promise<TaskStatusEntity> => {
        const payload = mapToApi(status);
        const response = await api.post('/estado-tareas', payload);
        return mapToTaskStatus(response.data);
    },

    update: async (id: string, status: Partial<TaskStatusEntity>): Promise<TaskStatusEntity> => {
        const payload = mapToApi(status);
        const response = await api.put(`/estado-tareas/${id}`, payload);
        return mapToTaskStatus(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/estado-tareas/${id}`);
    },
};
