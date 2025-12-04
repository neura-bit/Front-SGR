import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <h2>Bienvenido, {user?.name}</h2>
                    <p className="text-sm text-tertiary">Rol: {user?.role}</p>
                </div>

                <div className="header-actions">
                    <div className="user-info">
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role text-xs">{user?.email}</div>
                        </div>
                    </div>

                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut size={18} />
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    );
};
