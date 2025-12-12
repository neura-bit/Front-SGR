import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, Truck, ShieldCheck, MapPin, BarChart3 } from 'lucide-react';
import './Login.css';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await login(username, password);

        if (success) {
            navigate('/');
        }
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
                            type="text"
                            label="Usuario"
                            placeholder="Tu nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            icon={<User size={20} />}
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

                    <div className="login-footer">
                        <p className="text-secondary">
                            Contacte al administrador si olvidó sus credenciales.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
