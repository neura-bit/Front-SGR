export type UserRole = 'ADMIN' | 'ASESOR' | 'SUPERVISOR' | 'MENSAJERO';

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type TaskTypeEnum = 'entrega' | 'retiro';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    username: string;
    password?: string;
    active: boolean;
    branchId: string;
    roleId: string;
    createdAt?: Date;
    // Computed fields for display
    name?: string; // firstName + lastName
    email?: string; // For backward compatibility
    role?: UserRole; // For backward compatibility
}

export interface TaskType {
    id: string;
    name: string;
    description?: string;
    code: TaskTypeEnum;
    active: boolean;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    color?: string;
    active?: boolean;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    active?: boolean;
}

export interface Role {
    id: string;
    name: string;
    active?: boolean;
}

export interface TaskStatusEntity {
    id: string;
    name: string;
}

export interface Client {
    id: string;
    name: string;
    email?: string;
    phone: string;
    rucCi: string;
    address: string;
    city: string;
    detalle?: string;
    latitude?: number;
    longitude?: number;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Task {
    id: string;
    nombre: string;
    fechaLimite: string; // ISO date string
    fechaFin?: string | null;
    tiempoTotal?: number | null;
    comentario?: string | null;
    observacion?: string | null;
    proceso: boolean;
    fechaInicio: string; // ISO date string
    codigo: string;
    // Relationships
    taskTypeId: string; // tipoOperacion ID
    categoryId: string; // categoria ID
    clientId: string; // cliente ID
    taskStatusId: string; // estadoTarea ID
    createdById: string; // asesorCrea ID
    assignedCourierId?: string | null; // mensajeroAsignado ID
    supervisorId?: string | null; // supervisorAsigna ID
}

export interface CourierLocation {
    userId: string;
    location: Location;
    timestamp: Date;
    speed?: number;
    heading?: number;
}

export interface PerformanceMetrics {
    userId: string;
    tasksCompleted: number;
    tasksInProgress: number;
    averageCompletionTime: number; // in minutes
    onTimeDeliveryRate: number; // percentage
    customerRating?: number;
    totalDistance?: number; // in km
}

export interface DashboardStats {
    totalTasks: number;
    activeTasks: number;
    completedToday: number;
    activeCouriers: number;
    pendingTasks: number;
}
