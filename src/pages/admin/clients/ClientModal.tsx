import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Client } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { GoogleAddressPicker } from '../../../components/map/GoogleAddressPicker';
import { X, UserCheck, MapPin } from 'lucide-react';
import './Clients.css';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: Client;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client, onSuccess, onError }) => {
    const { addClient, updateClient } = useData();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        rucCi: '',
        address: '',
        city: '',
        detalle: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name,
                email: client.email || '',
                phone: client.phone,
                rucCi: client.rucCi,
                address: client.address,
                city: client.city,
                detalle: client.detalle || '',
                latitude: client.latitude,
                longitude: client.longitude,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                rucCi: '',
                address: '',
                city: '',
                detalle: '',
                latitude: undefined,
                longitude: undefined,
            });
        }
    }, [client]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const clientData = {
                ...formData,
            };

            if (client) {
                if (!client.id) {
                    throw new Error('No se puede actualizar un cliente sin ID válido');
                }
                await updateClient(client.id, clientData);
                if (onSuccess) onSuccess('Cliente actualizado correctamente');
            } else {
                await addClient({
                    id: `client${Date.now()}`,
                    ...clientData,
                });
                if (onSuccess) onSuccess('Cliente creado correctamente');
            }
            onClose();
        } catch (error) {
            if (onError) onError('Error al guardar el cliente. Por favor intente nuevamente.');
        }
    };

    return (
        <div className="client-modal-overlay">
            <div className="client-modal-backdrop" onClick={onClose} />

            <div className="client-modal-content client-modal-wide">
                <div className="client-modal-header">
                    <div className="flex items-center gap-3">
                        <div className="client-icon-box">
                            <UserCheck size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {client ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {client ? 'Modifica los datos del cliente' : 'Agrega un nuevo cliente al sistema'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="client-modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="client-modal-form">
                    <div className="client-modal-grid">
                        {/* Left Column - Basic Info */}
                        <div className="client-form-section">
                            <h3 className="client-section-title">
                                <UserCheck size={16} />
                                Información del Cliente
                            </h3>
                            <div className="space-y-4">
                                <Input
                                    label="Nombre Completo"
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    placeholder="Ej: cliente@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <Input
                                    label="RUC / CI"
                                    placeholder="Ej: 1712345678"
                                    value={formData.rucCi}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rucCi: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Teléfono"
                                    placeholder="Ej: 0999999999"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Ciudad"
                                    placeholder="Ej: Quito"
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    required
                                />
                                <div className="input-wrapper">
                                    <label className="input-label">Detalle / Referencia</label>
                                    <textarea
                                        value={formData.detalle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, detalle: e.target.value }))}
                                        className="input"
                                        rows={3}
                                        placeholder="Ej: Edificio azul, segundo piso, oficina 201"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Location */}
                        <div className="client-form-section">
                            <h3 className="client-section-title">
                                <MapPin size={16} />
                                Ubicación del Cliente
                            </h3>
                            <GoogleAddressPicker
                                address={formData.address}
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onLocationChange={(location) => setFormData(prev => ({
                                    ...prev,
                                    ...(location.address !== undefined && { address: location.address }),
                                    ...(location.latitude !== undefined && { latitude: location.latitude }),
                                    ...(location.longitude !== undefined && { longitude: location.longitude })
                                }))}
                            />
                        </div>
                    </div>

                    <div className="client-modal-actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-500/20 rounded-xl"
                        >
                            {client ? 'Guardar Cambios' : 'Crear Cliente'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
