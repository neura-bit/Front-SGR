import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Client } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, UserCheck } from 'lucide-react';
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
        phone: '',
        rucCi: '',
        address: '',
        city: '',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name,
                phone: client.phone,
                rucCi: client.rucCi,
                address: client.address,
                city: client.city,
                latitude: client.latitude?.toString() || '',
                longitude: client.longitude?.toString() || '',
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                rucCi: '',
                address: '',
                city: '',
                latitude: '',
                longitude: '',
            });
        }
    }, [client]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const clientData = {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
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

            <div className="client-modal-content">
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nombre Completo"
                                placeholder="Ej: Juan Pérez"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="RUC / CI"
                                placeholder="Ej: 1712345678"
                                value={formData.rucCi}
                                onChange={(e) => setFormData({ ...formData, rucCi: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Teléfono"
                                placeholder="Ej: 0999999999"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                            <Input
                                label="Ciudad"
                                placeholder="Ej: Quito"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Dirección"
                            placeholder="Ej: Av. Siempre Viva 123"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Latitud (Opcional)"
                                type="number"
                                step="any"
                                placeholder="Ej: -0.1807"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            />
                            <Input
                                label="Longitud (Opcional)"
                                type="number"
                                step="any"
                                placeholder="Ej: -78.4678"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
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
