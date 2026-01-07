import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, ShieldCheck, MapPin, BarChart3, Eye, EyeOff } from 'lucide-react';
import ubikaPantherLogo from '../assets/ubika-panther.png';
import './Login.css';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="login-page">
            {/* Split Background with Speed Lines */}
            <div className="login-background">
                <div className="bg-left">
                    <div className="speed-line speed-line-1"></div>
                    <div className="speed-line speed-line-2"></div>
                    <div className="speed-line speed-line-3"></div>
                    <div className="speed-line speed-line-4"></div>
                    <div className="speed-line speed-line-5"></div>
                </div>
                <div className="bg-right">
                    <div className="accent-line accent-line-1"></div>
                    <div className="accent-line accent-line-2"></div>
                    <div className="accent-line accent-line-3"></div>
                    <div className="accent-line accent-line-4"></div>
                    <div className="accent-line accent-line-5"></div>
                </div>
            </div>

            {/* Floating Card */}
            <div className="login-card">
                {/* Left Side - Branding */}
                <div className="card-branding">
                    <div className="branding-content">
                        <div className="branding-logo">
                            <img
                                src={ubikaPantherLogo}
                                alt="UBIKA Logo"
                                className="ubika-logo"
                            />
                        </div>
                        <h1>Sistema de Gestión de Rutas</h1>
                        <p className="branding-tagline">Optimiza, rastrea y entrega con eficiencia.</p>

                        <div className="branding-features">
                            <div className="feature-item">
                                <MapPin size={18} />
                                <span>Seguimiento en tiempo real</span>
                            </div>
                            <div className="feature-item">
                                <ShieldCheck size={18} />
                                <span>Seguridad garantizada</span>
                            </div>
                            <div className="feature-item">
                                <BarChart3 size={18} />
                                <span>Analíticas avanzadas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="card-form">
                    <div className="form-content">
                        <div className="form-header">
                            <h2>Iniciar Sesión</h2>
                            <p>Ingresa tus credenciales</p>
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

                            <div className="password-input-wrapper">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    label="Contraseña"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={<Lock size={20} />}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <Button type="submit" fullWidth isLoading={isLoading} size="lg">
                                Iniciar Sesión
                            </Button>
                        </form>

                        <div className="form-footer">
                            <p>¿Olvidaste tus credenciales? Contacta al administrador.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
