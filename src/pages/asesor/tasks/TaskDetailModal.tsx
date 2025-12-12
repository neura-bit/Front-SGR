import React from 'react';
import type { Task } from '../../../types/index';
import { X, Calendar, User, Clock, Tag, FileText, MapPin } from 'lucide-react';
import './AsesorTasks.css';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    getClientName: (id: string) => string;
    getTaskTypeName: (id: string) => string;
    getCategoryName: (id: string) => string;
    getTaskStatusName: (id: string) => string;
    getUserName: (id: string) => string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    isOpen,
    onClose,
    task,
    getClientName,
    getTaskTypeName,
    getCategoryName,
    getTaskStatusName,
    getUserName,
}) => {
    if (!isOpen || !task) return null;

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="task-detail-overlay">
            <div className="task-detail-backdrop" onClick={onClose} />
            <div className="task-detail-modal">
                <div className="task-detail-header">
                    <div className="task-detail-title-section">
                        <span className="task-detail-code">{task.codigo}</span>
                        <h2 className="task-detail-title">{task.nombre}</h2>
                    </div>
                    <button onClick={onClose} className="task-detail-close">
                        <X size={24} />
                    </button>
                </div>

                <div className="task-detail-content">
                    <div className="task-detail-grid">
                        <div className="task-detail-item">
                            <div className="task-detail-icon">
                                <User size={18} />
                            </div>
                            <div>
                                <span className="task-detail-label">Cliente</span>
                                <span className="task-detail-value">{getClientName(task.clientId)}</span>
                            </div>
                        </div>

                        <div className="task-detail-item">
                            <div className="task-detail-icon">
                                <Tag size={18} />
                            </div>
                            <div>
                                <span className="task-detail-label">Tipo de Operación</span>
                                <span className="task-detail-value">{getTaskTypeName(task.taskTypeId)}</span>
                            </div>
                        </div>

                        <div className="task-detail-item">
                            <div className="task-detail-icon">
                                <FileText size={18} />
                            </div>
                            <div>
                                <span className="task-detail-label">Categoría</span>
                                <span className="task-detail-value">{getCategoryName(task.categoryId)}</span>
                            </div>
                        </div>

                        <div className="task-detail-item">
                            <div className="task-detail-icon status-icon">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <span className="task-detail-label">Estado</span>
                                <span className={`task-detail-status ${task.proceso ? 'active' : 'completed'}`}>
                                    {getTaskStatusName(task.taskStatusId)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="task-detail-dates">
                        <div className="task-detail-date-item">
                            <Calendar size={16} />
                            <div>
                                <span className="task-detail-label">Fecha Inicio</span>
                                <span className="task-detail-value">{formatDateTime(task.fechaInicio)}</span>
                            </div>
                        </div>
                        <div className="task-detail-date-item">
                            <Clock size={16} />
                            <div>
                                <span className="task-detail-label">Fecha Límite</span>
                                <span className="task-detail-value">{formatDateTime(task.fechaLimite)}</span>
                            </div>
                        </div>
                        {task.fechaFin && (
                            <div className="task-detail-date-item completed">
                                <Clock size={16} />
                                <div>
                                    <span className="task-detail-label">Fecha Fin</span>
                                    <span className="task-detail-value">{formatDateTime(task.fechaFin)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="task-detail-assignments">
                        <h3>Asignaciones</h3>
                        <div className="task-detail-assignment-grid">
                            <div className="task-detail-assignment">
                                <span className="task-detail-label">Asesor Creador</span>
                                <span className="task-detail-value">{getUserName(task.createdById)}</span>
                            </div>
                            <div className="task-detail-assignment">
                                <span className="task-detail-label">Mensajero Asignado</span>
                                <span className="task-detail-value">
                                    {task.assignedCourierId ? getUserName(task.assignedCourierId) : 'Sin asignar'}
                                </span>
                            </div>
                            {task.supervisorId && (
                                <div className="task-detail-assignment">
                                    <span className="task-detail-label">Supervisor</span>
                                    <span className="task-detail-value">{getUserName(task.supervisorId)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {(task.comentario || task.observacion) && (
                        <div className="task-detail-notes">
                            {task.comentario && (
                                <div className="task-detail-note">
                                    <h4>Comentario</h4>
                                    <p>{task.comentario}</p>
                                </div>
                            )}
                            {task.observacion && (
                                <div className="task-detail-note">
                                    <h4>Observación</h4>
                                    <p>{task.observacion}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
