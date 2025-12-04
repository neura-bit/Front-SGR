import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, Truck, ShieldCheck, MapPin, BarChart3 } from 'lucide-react';
import { mockUsers } from '../utils/mockData';
import './Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            const success = login(email, password);

            if (success) {
                navigate('/');
            } else {
                setError('Credenciales inválidas');
                setIsLoading(false);
            }
        }, 500);
    };

    const handleQuickLogin = (userEmail: string) => {
        setEmail(userEmail);
        setPassword('demo123');
    };

    return (
        <div className="login-container">
            {/* Left Panel - Branding */}
            <div className="login-branding">
                <div className="branding-content">
                    <div className="branding-logo">
                        <Truck size={64} strokeWidth={1.5} />
                    </div>
                    <h1>Sistema de Gestión de Rutas</h1>
                    <p className="branding-tagline">Optimiza, rastrea y entrega con eficiencia.</p>

                    <div className="branding-features">
                        <div className="feature-item">
                            <MapPin size={24} />
                            <span>Seguimiento en tiempo real</span>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck size={24} />
                            <span>Seguridad garantizada</span>
                        </div>
                        <div className="feature-item">
                            <BarChart3 size={24} />
                            <span>Analíticas avanzadas</span>
                        </div>
                    </div>
                </div>
                <div className="branding-pattern"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="login-form-container">
                <div className="login-content">
                    <div className="form-header">
                        <h2>Bienvenido de nuevo</h2>
                        <p>Ingresa a tu cuenta para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            type="email"
                            label="Correo Electrónico"
                            placeholder="usuario@sgr.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={20} />}
                            required
                        />

                        <Input
                            type="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={20} />}
                            required
                        />

                        {error && <div className="error-message">{error}</div>}

                        <Button type="submit" fullWidth isLoading={isLoading} size="lg">
                            Iniciar Sesión
                        </Button>
                    </form>

                    <div className="divider">
                        <span>Acceso Rápido (Demo)</span>
                    </div>

                    <div className="demo-users">
                        {mockUsers.slice(0, 4).map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                className="demo-user-btn"
                                onClick={() => handleQuickLogin(user.email)}
                            >
                                <div className="demo-user-role">{user.role}</div>
                                <div className="demo-user-name">{user.name}</div>
                            </button>
                        ))}
                    </div>

                    <div className="login-footer">
                        <p>
                            Contraseña demo: <strong>demo123</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
