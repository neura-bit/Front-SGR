import axios from 'axios';
import type { UserRole } from '../types';

const API_BASE = 'http://localhost:8080/api';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    nombre: string;
    apellido: string;
    rol: string;
    idUsuario: number;
    expiresIn: number;
}

export interface AuthUser {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    name: string;
    role: UserRole;
    token: string;
    expiresAt: number;
}

const TOKEN_KEY = 'sgr_auth_token';
const USER_KEY = 'sgr_auth_user';

const mapRoleToUserRole = (rol: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
        'ADMIN': 'ADMIN',
        'ASESOR': 'ASESOR',
        'SUPERVISOR': 'SUPERVISOR',
        'MENSAJERO': 'MENSAJERO',
        'ROLE_ADMIN': 'ADMIN',
        'ROLE_ASESOR': 'ASESOR',
        'ROLE_SUPERVISOR': 'SUPERVISOR',
        'ROLE_MENSAJERO': 'MENSAJERO',
    };
    return roleMap[rol.toUpperCase()] || 'MENSAJERO';
};

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthUser> => {
        const response = await axios.post<LoginResponse>(
            `${API_BASE}/auth/login`,
            credentials,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;
        const expiresAt = Date.now() + data.expiresIn;

        const authUser: AuthUser = {
            id: String(data.idUsuario),
            username: data.username,
            firstName: data.nombre,
            lastName: data.apellido,
            name: `${data.nombre} ${data.apellido}`,
            role: mapRoleToUserRole(data.rol),
            token: data.token,
            expiresAt,
        };

        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));

        return authUser;
    },

    logout: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getStoredUser: (): AuthUser | null => {
        try {
            const userStr = localStorage.getItem(USER_KEY);
            if (!userStr) return null;

            const user: AuthUser = JSON.parse(userStr);

            // Check if token has expired
            if (user.expiresAt && Date.now() > user.expiresAt) {
                authService.logout();
                return null;
            }

            return user;
        } catch {
            return null;
        }
    },

    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated: (): boolean => {
        const user = authService.getStoredUser();
        return user !== null;
    },
};
