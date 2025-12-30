import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
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
                <div className="header-logo">
                    <Logo height={56} />
                </div>

                <div className="header-actions">
                    <div className="user-info">
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role-badge">{user?.role}</div>
                        </div>
                    </div>

                    <Button variant="ghost" onClick={handleLogout} className="logout-button">
                        <LogOut size={18} />
                    </Button>
                </div>
            </div>
        </header>
    );
};
