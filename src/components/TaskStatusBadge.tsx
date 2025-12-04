import React from 'react';
import type { TaskStatus } from '../types/index';

interface TaskStatusBadgeProps {
    status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'status-pending' },
    assigned: { label: 'Asignada', className: 'status-assigned' },
    in_progress: { label: 'En Progreso', className: 'status-in-progress' },
    completed: { label: 'Completada', className: 'status-completed' },
    cancelled: { label: 'Cancelada', className: 'status-cancelled' },
};

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
    const config = statusConfig[status];

    return (
        <span className={`status-badge ${config.className}`}>
            {config.label}
        </span>
    );
};
