import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { Task } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, ClipboardList, Paperclip, FileText, Download, Upload, Trash2, Image, File } from 'lucide-react';
import { taskService } from '../../../services/taskService';
import './Tasks.css';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSuccess, onError }) => {
    const { user } = useAuth();
    const { updateTask, clients, taskTypes, categories, taskStatuses, users, refreshClients, refreshTaskTypes, refreshCategories, refreshTaskStatuses, refreshUsers } = useData();

    // Check if logged-in user is an ASESOR
    const isAsesor = user?.role === 'ASESOR';
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

    // File upload state
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<{ file: File; preview: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Blob URLs for existing files (loaded with auth)
    const [fileBlobUrls, setFileBlobUrls] = useState<Record<number, string>>({});

    // Selected file for expanded preview
    const [selectedPreview, setSelectedPreview] = useState<{
        id: number;
        url: string;
        name: string;
        type: string;
    } | null>(null);

    // Local state for attachments (to update UI immediately on delete)
    const [localAttachments, setLocalAttachments] = useState(task?.archivosAdjuntos || []);

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
            // For new tasks, auto-set status to 'PENDIENTE'
            const pendienteStatus = taskStatuses.find(s => s.name.toUpperCase() === 'PENDIENTE');
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
                taskStatusId: pendienteStatus?.id || '',
                // Auto-select logged-in user if they are an ASESOR
                createdById: isAsesor && user?.id ? user.id : '',
                assignedCourierId: '',
                supervisorId: '',
            });
        }
        setErrors({});
        // Clear pending files when modal opens/closes
        setPendingFiles([]);
        setFilePreviews([]);
        setFileBlobUrls({});
        setSelectedPreview(null);
        // Sync local attachments with task
        setLocalAttachments(task?.archivosAdjuntos || []);
    }, [task, isOpen, taskStatuses, isAsesor, user?.id]);

    // Load blob URLs for existing image files
    useEffect(() => {
        if (!task?.archivosAdjuntos || task.archivosAdjuntos.length === 0) return;

        const loadFileBlobUrls = async () => {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
            const imageFiles = task.archivosAdjuntos!.filter(archivo =>
                archivo.tipoMime?.startsWith('image/') ||
                imageExtensions.some(ext => archivo.nombreOriginal?.toLowerCase().endsWith(`.${ext}`))
            );

            const urls: Record<number, string> = {};
            for (const archivo of imageFiles) {
                try {
                    const blobUrl = await taskService.getFileBlobUrl(archivo.idArchivo);
                    urls[archivo.idArchivo] = blobUrl;
                } catch (error) {
                    console.error(`Error loading preview for file ${archivo.idArchivo}:`, error);
                }
            }
            setFileBlobUrls(urls);
        };

        loadFileBlobUrls();

        // Cleanup blob URLs on unmount
        return () => {
            Object.values(fileBlobUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [task?.archivosAdjuntos]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        // Only validate codigo when editing (it's generated by backend for new tasks)
        if (task && !formData.codigo.trim()) {
            newErrors.codigo = 'El código es requerido';
        }
        // Removed fechaInicio validation - it will be set by another API
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
        // Only validate taskStatusId for editing (new tasks auto-set to CREADA)
        if (task && !formData.taskStatusId) {
            newErrors.taskStatusId = 'El estado es requerido';
        }
        if (!formData.createdById) {
            newErrors.createdById = 'El asesor creador es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (!isOpen) return null;

    // File handling functions
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const newPreviews = newFiles.map(file => {
            const preview = file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : '';
            return { file, preview };
        });

        setPendingFiles(prev => [...prev, ...newFiles]);
        setFilePreviews(prev => [...prev, ...newPreviews]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePendingFile = (index: number) => {
        // Revoke preview URL if it's an image
        if (filePreviews[index]?.preview) {
            URL.revokeObjectURL(filePreviews[index].preview);
        }
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const isImageFile = (file: File) => file.type.startsWith('image/');

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image size={20} />;
        return <File size={20} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsUploading(true);
            const taskData = {
                nombre: formData.nombre,
                codigo: formData.codigo,
                fechaInicio: formData.fechaInicio || new Date().toISOString(),
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

            let taskId: string;

            if (task) {
                if (!task.id) {
                    throw new Error('No se puede actualizar una tarea sin ID válido');
                }
                await updateTask(task.id, taskData);
                taskId = task.id;
            } else {
                // Use taskService.create directly to get the created task ID
                const newTask = await taskService.create(taskData);
                taskId = newTask.id;
            }

            // Upload pending files if any
            if (pendingFiles.length > 0 && taskId) {
                try {
                    await taskService.uploadFiles(taskId, pendingFiles);
                } catch (uploadError) {
                    console.error('Error uploading files:', uploadError);
                    if (onError) onError('Tarea guardada pero hubo un error al subir algunos archivos.');
                }
            }

            // Clean up preview URLs
            filePreviews.forEach(fp => {
                if (fp.preview) URL.revokeObjectURL(fp.preview);
            });

            if (onSuccess) onSuccess(task ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');
            onClose();
        } catch (error: any) {
            console.error('Error saving task:', error);
            if (onError) onError(error.message || 'Error al guardar la tarea. Por favor intente nuevamente.');
        } finally {
            setIsUploading(false);
        }
    };

    // Filter users by role name
    const asesores = users.filter(u => u.role === 'ASESOR');
    const mensajeros = users.filter(u => u.role === 'MENSAJERO');
    const supervisores = users.filter(u => u.role === 'SUPERVISOR');

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
                                {/* Código - only show when editing (generated by backend for new tasks) */}
                                {task && (
                                    <Input
                                        label="Código"
                                        placeholder="Ej: 0001"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        error={errors.codigo}
                                        disabled
                                    />
                                )}
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
                                {/* Fecha Inicio removed - will be set by another API */}
                                <Input
                                    label="Fecha Límite *"
                                    type="datetime-local"
                                    value={formData.fechaLimite}
                                    onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.value })}
                                    error={errors.fechaLimite}
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

                                {/* Estado - only show dropdown when editing */}
                                {task && (
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
                                )}
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
                                        disabled={isAsesor}
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
                            </div>
                        </div>

                        {/* Archivos Adjuntos */}
                        <div className="form-section">
                            <h3 className="form-section-title">
                                <Paperclip size={16} className="inline mr-2" />
                                Archivos Adjuntos
                            </h3>

                            {/* Archivos existentes (solo en edición) */}
                            {localAttachments.length > 0 && (
                                <div className="attachments-section">
                                    <p className="text-sm text-gray-500 mb-2">Archivos guardados:</p>

                                    {/* Preview expandido */}
                                    {selectedPreview && (
                                        <div className="file-preview-expanded">
                                            <div className="file-preview-header">
                                                <span className="file-preview-name">{selectedPreview.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPreview(null)}
                                                    className="file-preview-close"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="file-preview-content">
                                                {selectedPreview.type.startsWith('image/') ? (
                                                    <img
                                                        src={selectedPreview.url}
                                                        alt={selectedPreview.name}
                                                        className="file-preview-image"
                                                    />
                                                ) : selectedPreview.type === 'application/pdf' ? (
                                                    <iframe
                                                        src={selectedPreview.url}
                                                        title={selectedPreview.name}
                                                        className="file-preview-pdf"
                                                    />
                                                ) : (
                                                    <div className="file-preview-unsupported">
                                                        <FileText size={48} />
                                                        <p>Vista previa no disponible</p>
                                                        <p className="text-sm text-gray-400">Haz clic en descargar para ver el archivo</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="attachments-list">
                                        {localAttachments.map((archivo) => {
                                            // Check if file is an image by MIME type or by filename extension
                                            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
                                            const isImage = archivo.tipoMime?.startsWith('image/') ||
                                                imageExtensions.some(ext => archivo.nombreOriginal?.toLowerCase().endsWith(`.${ext}`));
                                            const isPdf = archivo.tipoMime === 'application/pdf';
                                            const canPreview = isImage || isPdf;

                                            // Get blob URL if available (loaded with auth)
                                            const blobUrl = fileBlobUrls[archivo.idArchivo];

                                            // Format file size
                                            const formatSize = (bytes?: number) => {
                                                if (!bytes) return '';
                                                if (bytes < 1024) return bytes + ' B';
                                                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                                                return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
                                            };

                                            // Handle view preview
                                            const handleViewPreview = async () => {
                                                try {
                                                    // Use existing blob URL or fetch new one
                                                    let url = blobUrl;
                                                    if (!url) {
                                                        url = await taskService.getFileBlobUrl(archivo.idArchivo);
                                                        setFileBlobUrls(prev => ({ ...prev, [archivo.idArchivo]: url }));
                                                    }
                                                    setSelectedPreview({
                                                        id: archivo.idArchivo,
                                                        url,
                                                        name: archivo.nombreOriginal,
                                                        type: archivo.tipoMime || ''
                                                    });
                                                } catch (error) {
                                                    console.error('Error loading preview:', error);
                                                    if (onError) onError('Error al cargar vista previa');
                                                }
                                            };

                                            // Handle download with auth
                                            const handleDownload = async (e: React.MouseEvent) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                try {
                                                    await taskService.downloadFile(archivo.idArchivo, archivo.nombreOriginal);
                                                } catch (error) {
                                                    console.error('Error downloading file:', error);
                                                    if (onError) onError('Error al descargar el archivo');
                                                }
                                            };

                                            // Handle delete file
                                            const handleDelete = async (e: React.MouseEvent) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                if (!confirm(`¿Estás seguro de eliminar "${archivo.nombreOriginal}"?`)) {
                                                    return;
                                                }

                                                try {
                                                    await taskService.deleteFile(archivo.idArchivo);

                                                    // Remove from local state immediately
                                                    setLocalAttachments(prev =>
                                                        prev.filter(a => a.idArchivo !== archivo.idArchivo)
                                                    );

                                                    // Remove from blob URLs if exists
                                                    if (fileBlobUrls[archivo.idArchivo]) {
                                                        URL.revokeObjectURL(fileBlobUrls[archivo.idArchivo]);
                                                        setFileBlobUrls(prev => {
                                                            const newUrls = { ...prev };
                                                            delete newUrls[archivo.idArchivo];
                                                            return newUrls;
                                                        });
                                                    }
                                                    // Close preview if this file was being previewed
                                                    if (selectedPreview?.id === archivo.idArchivo) {
                                                        setSelectedPreview(null);
                                                    }
                                                    // Notify success
                                                    if (onSuccess) onSuccess('Archivo eliminado correctamente');
                                                } catch (error) {
                                                    console.error('Error deleting file:', error);
                                                    if (onError) onError('Error al eliminar el archivo');
                                                }
                                            };

                                            return (
                                                <div
                                                    key={archivo.idArchivo}
                                                    className={`attachment-item ${canPreview ? 'clickable' : ''}`}
                                                    onClick={canPreview ? handleViewPreview : undefined}
                                                    title={canPreview ? 'Clic para ver' : ''}
                                                >
                                                    {isImage && blobUrl ? (
                                                        <div className="attachment-preview">
                                                            <img src={blobUrl} alt={archivo.nombreOriginal} />
                                                        </div>
                                                    ) : (
                                                        <div className="attachment-icon">
                                                            <FileText size={20} />
                                                        </div>
                                                    )}
                                                    <div className="attachment-info">
                                                        <span className="attachment-name">{archivo.nombreOriginal}</span>
                                                        <span className="attachment-type">
                                                            {archivo.tipoMime} {formatSize(archivo.tamanioBytes)}
                                                        </span>
                                                    </div>
                                                    <div className="attachment-actions">
                                                        <button
                                                            type="button"
                                                            onClick={handleDownload}
                                                            className="attachment-download"
                                                            title="Descargar"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleDelete}
                                                            className="attachment-delete"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Archivos pendientes de subir */}
                            {pendingFiles.length > 0 && (
                                <div className="pending-files-section">
                                    <p className="text-sm text-gray-500 mb-2">Archivos por subir:</p>
                                    <div className="attachments-list">
                                        {filePreviews.map((fp, index) => (
                                            <div key={index} className="attachment-item pending">
                                                {isImageFile(fp.file) && fp.preview ? (
                                                    <div className="attachment-preview">
                                                        <img src={fp.preview} alt={fp.file.name} />
                                                    </div>
                                                ) : (
                                                    <div className="attachment-icon file-icon">
                                                        {getFileIcon(fp.file)}
                                                    </div>
                                                )}
                                                <div className="attachment-info">
                                                    <span className="attachment-name">{fp.file.name}</span>
                                                    <span className="attachment-type">{formatFileSize(fp.file.size)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePendingFile(index)}
                                                    className="attachment-remove"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botón para agregar archivos */}
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    multiple
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="file-upload-btn"
                                >
                                    <Upload size={18} />
                                    <span>Agregar Archivos</span>
                                </button>
                                <p className="file-upload-hint">
                                    Imágenes, PDF, Word, Excel (máx. 10MB por archivo)
                                </p>
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
                            isLoading={isUploading}
                            disabled={isUploading}
                        >
                            {isUploading
                                ? 'Guardando...'
                                : (task ? 'Guardar Cambios' : 'Crear Tarea')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
