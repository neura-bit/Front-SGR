import api from './api';
import type { Task } from '../types';

interface ApiTask {
    idTarea?: number;
    nombre: string;
    fechaLimite: string;
    fechaFin?: string | null;
    tiempoTotal?: number | null;
    comentario?: string | null;
    observacion?: string | null;
    proceso: boolean;
    fechaInicio: string;
    codigo: string;
    tipoOperacion: { idTipoOperacion: number };
    categoria: { idCategoria: number };
    cliente: { idCliente: number };
    estadoTarea: { idEstadoTarea: number };
    asesorCrea: { idUsuario: number };
    mensajeroAsignado?: { idUsuario: number } | null;
    supervisorAsigna?: { idUsuario: number } | null;
}

const mapToTask = (data: any): Task => {
    const id = String(data.idTarea || data.id || '');

    const task: Task = {
        id,
        nombre: data.nombre || '',
        fechaLimite: data.fechaLimite || '',
        fechaFin: data.fechaFin,
        tiempoTotal: data.tiempoTotal,
        comentario: data.comentario,
        observacion: data.observacion,
        proceso: data.proceso ?? false,
        fechaInicio: data.fechaInicio || '',
        codigo: data.codigo || '',
        taskTypeId: String(data.tipoOperacion?.idTipoOperacion || ''),
        categoryId: String(data.categoria?.idCategoria || ''),
        clientId: String(data.cliente?.idCliente || ''),
        taskStatusId: String(data.estadoTarea?.idEstadoTarea || ''),
        createdById: String(data.asesorCrea?.idUsuario || ''),
        assignedCourierId: data.mensajeroAsignado?.idUsuario ? String(data.mensajeroAsignado.idUsuario) : null,
        supervisorId: data.supervisorAsigna?.idUsuario ? String(data.supervisorAsigna.idUsuario) : null,
    };

    return task;
};

const mapToApi = (data: Partial<Task>): Partial<ApiTask> => {
    const payload: any = {};

    if (data.nombre !== undefined) payload.nombre = data.nombre;
    if (data.fechaLimite !== undefined) payload.fechaLimite = data.fechaLimite;
    if (data.fechaFin !== undefined) payload.fechaFin = data.fechaFin;
    if (data.tiempoTotal !== undefined) payload.tiempoTotal = data.tiempoTotal;
    if (data.comentario !== undefined) payload.comentario = data.comentario;
    if (data.observacion !== undefined) payload.observacion = data.observacion;
    if (data.proceso !== undefined) payload.proceso = data.proceso;
    if (data.fechaInicio !== undefined) payload.fechaInicio = data.fechaInicio;
    if (data.codigo !== undefined) payload.codigo = data.codigo;

    // Map relationships
    if (data.taskTypeId) {
        payload.tipoOperacion = { idTipoOperacion: parseInt(data.taskTypeId) };
    }
    if (data.categoryId) {
        payload.categoria = { idCategoria: parseInt(data.categoryId) };
    }
    if (data.clientId) {
        payload.cliente = { idCliente: parseInt(data.clientId) };
    }
    if (data.taskStatusId) {
        payload.estadoTarea = { idEstadoTarea: parseInt(data.taskStatusId) };
    }
    if (data.createdById) {
        payload.asesorCrea = { idUsuario: parseInt(data.createdById) };
    }
    if (data.assignedCourierId) {
        payload.mensajeroAsignado = { idUsuario: parseInt(data.assignedCourierId) };
    }
    if (data.supervisorId) {
        payload.supervisorAsigna = { idUsuario: parseInt(data.supervisorId) };
    }

    return payload;
};

export const taskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get('/tareas');
        // Handle both array response and object-wrapped response
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.tareas || []);
        return data.map(mapToTask);
    },

    getById: async (id: string): Promise<Task> => {
        const response = await api.get(`/tareas/${id}`);
        return mapToTask(response.data);
    },

    create: async (task: Omit<Task, 'id'>): Promise<Task> => {
        const payload = mapToApi(task);
        const response = await api.post('/tareas', payload);
        return mapToTask(response.data);
    },

    update: async (id: string, task: Partial<Task>): Promise<Task> => {
        const payload = mapToApi(task);
        const response = await api.put(`/tareas/${id}`, payload);
        return mapToTask(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tareas/${id}`);
    },

    resendCode: async (id: string): Promise<{ mensaje: string }> => {
        const response = await api.post(`/tareas/${id}/reenviar-codigo`);
        return response.data;
    },
};
