import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Client } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, UserCheck, Phone, MapPin, CreditCard } from 'lucide-react';
import { ClientModal } from './ClientModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './Clients.css';

export const ClientList: React.FC = () => {
    const { clients, deleteClient, refreshClients } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
    const [filteredClients, setFilteredClients] = useState<Client[]>(clients);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshClients();
    }, []);

    useEffect(() => {
        const filtered = clients.filter(
            (client) =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.rucCi.includes(searchTerm)
        );
        setFilteredClients(filtered);
    }, [clients, searchTerm]);

    const handleOpenModal = (client?: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedClient(undefined);
        setIsModalOpen(false);
    };

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 2000);
    };

    const handleError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 3000);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setClientToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (clientToDelete) {
            try {
                await deleteClient(clientToDelete);
                handleSuccess('Cliente eliminado correctamente');
            } catch (error) {
                handleError('Error al eliminar el cliente. Por favor intente nuevamente.');
            } finally {
                setClientToDelete(null);
            }
        }
    };

    const totalClients = clients.length;

    return (
        <div className="clients-container">
            <div className="clients-header">
                <div>
                    <h1 className="clients-title">Clientes</h1>
                    <p className="clients-subtitle">Gestiona la información de tus clientes.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-client">
                    <Plus size={20} className="mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            <div className="clients-stats-grid">
                {[
                    { icon: UserCheck, label: 'Total Clientes', value: totalClients, color: 'text-gray-900', bg: 'bg-gray-50 dark:bg-gray-900/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="clients-stat-card group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                        </div>
                        <div className={`stat-icon-wrapper ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="clients-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ciudad o RUC/CI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="clients-grid">
                {filteredClients.map((client, index) => (
                    <div
                        key={client.id || index}
                        onClick={() => handleOpenModal(client)}
                        className="client-card group"
                    >
                        <div className="client-card-content">
                            <div className="client-card-header">
                                <div className="client-icon-box">
                                    <UserCheck size={24} />
                                </div>
                            </div>

                            <div className="client-info">
                                <h3 className="client-name">{client.name}</h3>

                                <div className="client-detail">
                                    <CreditCard size={16} />
                                    <span>{client.rucCi}</span>
                                </div>

                                <div className="client-detail">
                                    <Phone size={16} />
                                    <span>{client.phone}</span>
                                </div>

                                <div className="client-detail">
                                    <MapPin size={16} />
                                    <span>{client.city} - {client.address}</span>
                                </div>
                            </div>

                            <div className="client-actions-overlay">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(client); }}
                                    className="client-action-btn"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(client.id, e)}
                                    className="client-action-btn delete"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="clients-empty-state">
                    <div className="empty-icon-circle">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                        No hay clientes que coincidan con tu búsqueda o aún no has creado ninguno.
                    </p>
                    <Button onClick={() => setSearchTerm('')} variant="secondary">
                        Limpiar Búsqueda
                    </Button>
                </div>
            )}

            {isModalOpen && (
                <ClientModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    client={selectedClient}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Cliente"
                message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />

            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                message={successMessage || ''}
            />

            {errorMessage && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-50 animate-fade-in" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{errorMessage}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMessage(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                    </span>
                </div>
            )}
        </div>
    );
};
