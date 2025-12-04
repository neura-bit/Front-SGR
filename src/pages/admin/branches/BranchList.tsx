import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Branch } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Building2 } from 'lucide-react';
import { BranchModal } from './BranchModal.tsx';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './Branches.css';

export const BranchList: React.FC = () => {
    const { branches, deleteBranch, refreshBranches } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(undefined);
    const [filteredBranches, setFilteredBranches] = useState<Branch[]>(branches);

    // New state for confirmation and success modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshBranches();
    }, []);

    useEffect(() => {
        const filtered = branches.filter(
            (branch) =>
                branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBranches(filtered);
    }, [branches, searchTerm]);

    const handleOpenModal = (branch?: Branch) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedBranch(undefined);
        setIsModalOpen(false);
    };

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        // The modal will auto-close, but we can clear the message state if needed after duration
        setTimeout(() => setSuccessMessage(null), 2000);
    };

    const handleError = (message: string) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 3000);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {

        e.stopPropagation();
        setBranchToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (branchToDelete) {
            try {
                await deleteBranch(branchToDelete);
                handleSuccess('Sucursal eliminada correctamente');
            } catch (error) {
                handleError('Error al eliminar la sucursal. Por favor intente nuevamente.');
            } finally {
                setBranchToDelete(null);
            }
        }
    };

    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.active).length;

    return (
        <div className="branches-container">
            {/* Header Section */}
            <div className="branches-header">
                <div>
                    <h1 className="branches-title">
                        Sucursales
                    </h1>
                    <p className="branches-subtitle">
                        Gestiona tu red operativa y puntos de venta.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    size="lg"
                    className="btn-new-branch"
                >
                    <Plus size={20} className="mr-2" />
                    Nueva Sucursal
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="branches-stats-grid">
                {[
                    { icon: MapPin, label: 'Total Sucursales', value: totalBranches, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { icon: Building2, label: 'Sedes Activas', value: activeBranches, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { icon: Phone, label: 'Directorio', value: totalBranches, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
                ].map((stat, idx) => (
                    <div key={idx} className="branches-stat-card group">
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
            <div className="branches-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ciudad, dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="branches-grid">
                {filteredBranches.map((branch, index) => (
                    <div
                        key={branch.id || index}
                        onClick={() => handleOpenModal(branch)}
                        className="branch-card group"
                    >
                        {/* Status Bar Top */}
                        <div className={`branch-status-bar ${branch.active ? 'active' : 'inactive'}`} />

                        <div className="branch-card-content">
                            {/* Header */}
                            <div className="branch-card-header">
                                <div className="branch-icon-box">
                                    <Building2 size={24} />
                                </div>

                                {/* Status Badge */}
                                <span className={`branch-status-badge ${branch.active ? 'active' : 'inactive'}`}>
                                    {branch.active ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="branch-info">
                                <h3 className="branch-name">
                                    {branch.name}
                                </h3>
                                <p className="branch-city">
                                    {branch.city}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="branch-details">
                                <div className="branch-detail-item">
                                    <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                                    <span className="line-clamp-2">{branch.address}</span>
                                </div>
                                <div className="branch-detail-item">
                                    <Phone size={16} className="text-gray-400 shrink-0" />
                                    <span>{branch.phone}</span>
                                </div>
                            </div>

                            {/* Actions Overlay (Visible on Hover) */}
                            <div className="branch-actions-overlay">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(branch); }}
                                    className="branch-action-btn"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(branch.id, e)}
                                    className="branch-action-btn delete"
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
            {filteredBranches.length === 0 && (
                <div className="branches-empty-state">
                    <div className="empty-icon-circle">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                        No hay sucursales que coincidan con tu búsqueda o aún no has creado ninguna.
                    </p>
                    <Button onClick={() => setSearchTerm('')} variant="secondary">
                        Limpiar Búsqueda
                    </Button>
                </div>
            )}

            {isModalOpen && (
                <BranchModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    branch={selectedBranch}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Sucursal"
                message="¿Estás seguro de que deseas eliminar esta sucursal? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />

            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                message={successMessage || ''}
            />

            {/* Error Toast/Modal - Simple implementation for now */}
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