import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Task } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, ClipboardList } from 'lucide-react';
import './Tasks.css';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSuccess, onError }) => {
    const { addTask, updateTask, clients, taskTypes, categories, taskStatuses, users, refreshClients, refreshTaskTypes, refreshCategories, refreshTaskStatuses, refreshUsers } = useData();
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        fechaInicio: '',
        fechaLimite: '',
        fechaFin: '',
        comentario: '',
        observacion: '',
        proceso: true,
        clientId: '',
        taskTypeId: '',
        categoryId: '',
        taskStatusId: '',
        createdById: '',
        assignedCourierId: '',
        supervisorId: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Load all related data
        refreshClients();
        refreshTaskTypes();
        refreshCategories();
        refreshTaskStatuses();
        refreshUsers();
    }, []);

    useEffect(() => {
        if (task) {
            setFormData({
                nombre: task.nombre || '',
                codigo: task.codigo || '',
                fechaInicio: task.fechaInicio ? task.fechaInicio.slice(0, 16) : '',
                fechaLimite: task.fechaLimite ? task.fechaLimite.slice(0, 16) : '',
                fechaFin: task.fechaFin ? task.fechaFin.slice(0, 16) : '',
                comentario: task.comentario || '',
                observacion: task.observacion || '',
                proceso: task.proceso ?? true,
                clientId: task.clientId || '',
                taskTypeId: task.taskTypeId || '',
                categoryId: task.categoryId || '',
                taskStatusId: task.taskStatusId || '',
                createdById: task.createdById || '',
                assignedCourierId: task.assignedCourierId || '',
                supervisorId: task.supervisorId || '',
            });
        } else {
            setFormData({
                nombre: '',
                codigo: '',
                fechaInicio: '',
                fechaLimite: '',
                fechaFin: '',
                comentario: '',
                observacion: '',
                proceso: true,
                clientId: '',
                taskTypeId: '',
                categoryId: '',
                taskStatusId: '',
                createdById: '',
                assignedCourierId: '',
                supervisorId: '',
            });
        }
        setErrors({});
    }, [task, isOpen]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.codigo.trim()) {
            newErrors.codigo = 'El código es requerido';
        }
        if (!formData.fechaInicio) {
            newErrors.fechaInicio = 'La fecha de inicio es requerida';
        }
        if (!formData.fechaLimite) {
            newErrors.fechaLimite = 'La fecha límite es requerida';
        }
        if (!formData.clientId) {
            newErrors.clientId = 'El cliente es requerido';
        }
        if (!formData.taskTypeId) {
            newErrors.taskTypeId = 'El tipo de operación es requerido';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'La categoría es requerida';
        }
        if (!formData.taskStatusId) {
            newErrors.taskStatusId = 'El estado es requerido';
        }
        if (!formData.createdById) {
            newErrors.createdById = 'El asesor creador es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            const taskData = {
                nombre: formData.nombre,
                codigo: formData.codigo,
                fechaInicio: formData.fechaInicio,
                fechaLimite: formData.fechaLimite,
                fechaFin: formData.fechaFin || null,
                comentario: formData.comentario || null,
                observacion: formData.observacion || null,
                proceso: formData.proceso,
                tiempoTotal: null,
                clientId: formData.clientId,
                taskTypeId: formData.taskTypeId,
                categoryId: formData.categoryId,
                taskStatusId: formData.taskStatusId,
                createdById: formData.createdById,
                assignedCourierId: formData.assignedCourierId || null,
                supervisorId: formData.supervisorId || null,
            };

            if (task) {
                if (!task.id) {
                    throw new Error('No se puede actualizar una tarea sin ID válido');
                }
                await updateTask(task.id, taskData);
                if (onSuccess) onSuccess('Tarea actualizada correctamente');
            } else {
                await addTask(taskData);
                if (onSuccess) onSuccess('Tarea creada correctamente');
            }
            onClose();
        } catch (error: any) {
            console.error('Error saving task:', error);
            if (onError) onError(error.message || 'Error al guardar la tarea. Por favor intente nuevamente.');
        }
    };

    // Filter users by role
    const asesores = users.filter(u => u.roleId === '2'); // Assuming roleId 2 is ASESOR
    const mensajeros = users.filter(u => u.roleId === '4'); // Assuming roleId 4 is MENSAJERO
    const supervisores = users.filter(u => u.roleId === '3'); // Assuming roleId 3 is SUPERVISOR

    return (
        <div className="task-modal-overlay">
            <div className="task-modal-backdrop" onClick={onClose} />

            <div className="task-modal-content">
                <div className="task-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="task-icon-box">
                            <ClipboardList size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {task ? 'Editar Tarea' : 'Nueva Tarea'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {task ? 'Modifica los datos existentes' : 'Agrega una nueva tarea'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="task-modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="task-modal-form">
                    <div className="space-y-4">
                        {/* Información Básica */}
                        <div className="form-section">
                            <h3 className="form-section-title">Información Básica</h3>
                            <div className="form-grid">
                                <Input
                                    label="Código *"
                                    placeholder="Ej: 0001"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                    error={errors.codigo}
                                />
                                <Input
                                    label="Nombre *"
                                    placeholder="Ej: Entrega de equipo a cliente"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    error={errors.nombre}
                                />
                            </div>
                        </div>

                        {/* Fechas */}
                        <div className="form-section">
                            <h3 className="form-section-title">Fechas</h3>
                            <div className="form-grid">
                                <Input
                                    label="Fecha Inicio *"
                                    type="datetime-local"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                    error={errors.fechaInicio}
                                />
                                <Input
                                    label="Fecha Límite *"
                                    type="datetime-local"
                                    value={formData.fechaLimite}
                                    onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.value })}
                                    error={errors.fechaLimite}
                                />
                                <Input
                                    label="Fecha Fin"
                                    type="datetime-local"
                                    value={formData.fechaFin}
                                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Relaciones */}
                        <div className="form-section">
                            <h3 className="form-section-title">Clasificación</h3>
                            <div className="form-grid">
                                <div className="input-wrapper">
                                    <label className="input-label">Cliente *</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className={`input ${errors.clientId ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccione un cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.clientId && <span className="input-error-text">{errors.clientId}</span>}
                                </div>

                                <div className="input-wrapper">
                                    <label className="input-label">Tipo de Operación *</label>
                                    <select
                                        value={formData.taskTypeId}
                                        onChange={(e) => setFormData({ ...formData, taskTypeId: e.target.value })}
                                        className={`input ${errors.taskTypeId ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccione un tipo</option>
                                        {taskTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.taskTypeId && <span className="input-error-text">{errors.taskTypeId}</span>}
                                </div>

                                <div className="input-wrapper">
                                    <label className="input-label">Categoría *</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className={`input ${errors.categoryId ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccione una categoría</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <span className="input-error-text">{errors.categoryId}</span>}
                                </div>

                                <div className="input-wrapper">
                                    <label className="input-label">Estado *</label>
                                    <select
                                        value={formData.taskStatusId}
                                        onChange={(e) => setFormData({ ...formData, taskStatusId: e.target.value })}
                                        className={`input ${errors.taskStatusId ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccione un estado</option>
                                        {taskStatuses.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.taskStatusId && <span className="input-error-text">{errors.taskStatusId}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Asignación */}
                        <div className="form-section">
                            <h3 className="form-section-title">Asignación</h3>
                            <div className="form-grid">
                                <div className="input-wrapper">
                                    <label className="input-label">Asesor Creador *</label>
                                    <select
                                        value={formData.createdById}
                                        onChange={(e) => setFormData({ ...formData, createdById: e.target.value })}
                                        className={`input ${errors.createdById ? 'input-error' : ''}`}
                                    >
                                        <option value="">Seleccione un asesor</option>
                                        {asesores.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                        {/* If no specific asesores, show all users */}
                                        {asesores.length === 0 && users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.createdById && <span className="input-error-text">{errors.createdById}</span>}
                                </div>

                                <div className="input-wrapper">
                                    <label className="input-label">Mensajero Asignado</label>
                                    <select
                                        value={formData.assignedCourierId}
                                        onChange={(e) => setFormData({ ...formData, assignedCourierId: e.target.value })}
                                        className="input"
                                    >
                                        <option value="">Sin asignar</option>
                                        {mensajeros.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                        {/* If no specific mensajeros, show all users */}
                                        {mensajeros.length === 0 && users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-wrapper">
                                    <label className="input-label">Supervisor</label>
                                    <select
                                        value={formData.supervisorId}
                                        onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                                        className="input"
                                    >
                                        <option value="">Sin asignar</option>
                                        {supervisores.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                        {/* If no specific supervisores, show all users */}
                                        {supervisores.length === 0 && users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Comentarios */}
                        <div className="form-section">
                            <h3 className="form-section-title">Comentarios</h3>
                            <div className="space-y-4">
                                <div className="input-wrapper">
                                    <label className="input-label">Comentario</label>
                                    <textarea
                                        value={formData.comentario}
                                        onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                                        className="input"
                                        rows={3}
                                        placeholder="Ej: Prioridad alta, cliente espera en oficina"
                                    />
                                </div>
                                <div className="input-wrapper">
                                    <label className="input-label">Observación</label>
                                    <textarea
                                        value={formData.observacion}
                                        onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                        className="input"
                                        rows={3}
                                        placeholder="Observaciones adicionales"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Estado de Proceso */}
                        <div className="input-wrapper">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.proceso}
                                    onChange={(e) => setFormData({ ...formData, proceso: e.target.checked })}
                                    className="checkbox-input"
                                />
                                <span>En proceso</span>
                            </label>
                        </div>
                    </div>

                    <div className="task-modal-actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-500/20 rounded-xl"
                        >
                            {task ? 'Guardar Cambios' : 'Crear Tarea'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
