import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Role } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, Shield } from 'lucide-react';
import { RoleModal } from './RoleModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './Roles.css';

export const RoleList: React.FC = () => {
    const { roles, deleteRole, refreshRoles } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>(roles);

    // State for confirmation and success modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshRoles();
    }, []);

    useEffect(() => {
        const filtered = roles.filter(
            (role) =>
                role.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRoles(filtered);
    }, [roles, searchTerm]);

    const handleOpenModal = (role?: Role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedRole(undefined);
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
        setRoleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (roleToDelete) {
            try {
                await deleteRole(roleToDelete);
                handleSuccess('Rol eliminado correctamente');
            } catch (error) {
                handleError('Error al eliminar el rol. Por favor intente nuevamente.');
            } finally {
                setRoleToDelete(null);
            }
        }
    };

    const totalRoles = roles.length;

    return (
        <div className="roles-container">
            {/* Header Section */}
            <div className="roles-header">
                <div>
                    <h1 className="roles-title">
                        Roles
                    </h1>
                    <p className="roles-subtitle">
                        Gestiona los roles y permisos del sistema.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    size="lg"
                    className="btn-new-role"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo Rol
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="roles-stats-grid">
                {[
                    { icon: Shield, label: 'Total Roles', value: totalRoles, color: 'text-gray-900', bg: 'bg-gray-50 dark:bg-gray-900/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="roles-stat-card group">
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

            {/* Search Bar & Filters */}
            <div className="roles-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="roles-grid">
                {filteredRoles.map((role, index) => (
                    <div
                        key={role.id || index}
                        onClick={() => handleOpenModal(role)}
                        className="role-card group"
                    >
                        <div className="role-card-content">
                            <div className="role-card-header">
                                <div className="role-icon-box">
                                    <Shield size={24} />
                                </div>
                            </div>

                            <div className="role-info">
                                <h3 className="role-name">
                                    {role.name}
                                </h3>
                            </div>

                            {/* Actions Overlay (Visible on Hover) */}
                            <div className="role-actions-overlay">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(role); }}
                                    className="role-action-btn"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(role.id, e)}
                                    className="role-action-btn delete"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredRoles.length === 0 && (
                <div className="roles-empty-state">
                    <div className="empty-icon-circle">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                        No hay roles que coincidan con tu búsqueda o aún no has creado ninguno.
                    </p>
                    <Button onClick={() => setSearchTerm('')} variant="secondary">
                        Limpiar Búsqueda
                    </Button>
                </div>
            )}

            {isModalOpen && (
                <RoleModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    role={selectedRole}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Rol"
                message="¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />

            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                message={successMessage || ''}
            />

            {/* Error Toast/Modal */}
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
