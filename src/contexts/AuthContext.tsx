import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/index';
import { authService } from '../services/authService';
import type { AuthUser } from '../services/authService';

interface AuthContextType {
    user: AuthUser | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasRole: (roles: UserRole[]) => boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for stored user on mount
    useEffect(() => {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            setError(null);
            setIsLoading(true);

            const authUser = await authService.login({ username, password });
            setUser(authUser);

            return true;
        } catch (err: any) {
            const message = err.response?.data?.message ||
                err.response?.data?.error ||
                'Error de autenticación. Verifique sus credenciales.';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setError(null);
    };

    const hasRole = (roles: UserRole[]): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const isAuthenticated = user !== null;

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            hasRole,
            isAuthenticated,
            isLoading,
            error,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
