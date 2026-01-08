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

    // Support both nested response (from regular API) and flat response (from date range API)
    const task: Task = {
        id,
        nombre: data.nombre || '',
        fechaLimite: data.fechaLimite || '',
        fechaFin: data.fechaFin,
        tiempoTotal: data.tiempoTotal,
        comentario: data.comentario,
        observacion: data.observacion,
        proceso: data.proceso ?? false,
        fechaInicio: data.fechaInicio || data.fechaCreacion || '',
        codigo: data.codigo || '',
        // Support both nested and flat response formats
        taskTypeId: String(data.tipoOperacion?.idTipoOperacion || data.idTipoOperacion || ''),
        categoryId: String(data.categoria?.idCategoria || data.idCategoria || ''),
        clientId: String(data.cliente?.idCliente || data.idCliente || ''),
        taskStatusId: String(data.estadoTarea?.idEstadoTarea || data.idEstadoTarea || ''),
        createdById: String(data.asesorCrea?.idUsuario || data.idAsesorCrea || ''),
        assignedCourierId: data.mensajeroAsignado?.idUsuario
            ? String(data.mensajeroAsignado.idUsuario)
            : (data.idMensajeroAsignado ? String(data.idMensajeroAsignado) : null),
        supervisorId: data.supervisorAsigna?.idUsuario
            ? String(data.supervisorAsigna.idUsuario)
            : (data.idSupervisorAsigna ? String(data.idSupervisorAsigna) : null),
        // Attachments
        archivosAdjuntos: Array.isArray(data.archivosAdjuntos) ? data.archivosAdjuntos : [],
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

    getByDateRange: async (fechaInicio: string, fechaFin: string): Promise<Task[]> => {
        const response = await api.get('/tareas/por-fechas', {
            params: { fechaInicio, fechaFin }
        });
        const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.tareas || []);
        return data.map(mapToTask);
    },

    uploadFile: async (taskId: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('archivo', file);
        const response = await api.post(`/tareas/${taskId}/archivos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadFiles: async (taskId: string, files: File[]): Promise<any[]> => {
        const results = [];
        for (const file of files) {
            const result = await taskService.uploadFile(taskId, file);
            results.push(result);
        }
        return results;
    },

    deleteFile: async (fileId: number): Promise<void> => {
        await api.delete(`/archivos/${fileId}`);
    },

    getFileBlob: async (fileId: number): Promise<Blob> => {
        const response = await api.get(`/archivos/${fileId}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    getFileBlobUrl: async (fileId: number): Promise<string> => {
        const blob = await taskService.getFileBlob(fileId);
        return URL.createObjectURL(blob);
    },

    downloadFile: async (fileId: number, fileName: string): Promise<void> => {
        const blob = await taskService.getFileBlob(fileId);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
};
