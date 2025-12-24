import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { User } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import { UserModal } from './UserModal.tsx';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './Users.css';

export const UserList: React.FC = () => {
    const { users, deleteUser, refreshUsers, branches, roles, refreshBranches, refreshRoles } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshUsers();
        refreshBranches();
        refreshRoles();
    }, []);

    useEffect(() => {
        const filtered = users.filter(
            (user) =>
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [users, searchTerm]);

    const handleOpenModal = (user?: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(undefined);
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
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete);
                handleSuccess('Usuario eliminado correctamente');
            } catch (error) {
                handleError('Error al eliminar el usuario. Por favor intente nuevamente.');
            } finally {
                setUserToDelete(null);
            }
        }
    };

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.active).length;

    const getBranchName = (branchId: string) => {
        const branch = branches.find(b => b.id === branchId);
        return branch?.name || 'Sin sucursal';
    };

    const getRoleName = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        return role?.name || 'Sin rol';
    };

    return (
        <div className="users-container">
            <div className="users-header">
                <div>
                    <h1 className="users-title">Usuarios</h1>
                    <p className="users-subtitle">Gestiona los usuarios del sistema.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-user">
                    <Plus size={20} className="mr-2" />
                    Nuevo Usuario
                </Button>
            </div>

            <div className="users-stats-grid">
                <div className="users-stat-card group">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Usuarios</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                        <UserIcon size={24} />
                    </div>
                </div>
                <div className="users-stat-card group">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Usuarios Activos</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{activeUsers}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-green-50 dark:bg-green-900/20 text-green-600">
                        <UserIcon size={24} />
                    </div>
                </div>
            </div>

            <div className="users-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Sucursal</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-name-cell">
                                        <div className="user-avatar">
                                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                        </div>
                                        <span>{user.firstName} {user.lastName}</span>
                                    </div>
                                </td>
                                <td>{user.username}</td>
                                <td>{user.email || '-'}</td>
                                <td>{user.phone || '-'}</td>
                                <td>{getBranchName(user.branchId)}</td>
                                <td>
                                    <span className="role-badge">{getRoleName(user.roleId)}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                                        {user.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="action-btn edit"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(user.id, e)}
                                            className="action-btn delete"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="users-empty-state">
                        <div className="empty-icon-circle">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                            No hay usuarios que coincidan con tu búsqueda.
                        </p>
                        <Button onClick={() => setSearchTerm('')} variant="secondary">
                            Limpiar Búsqueda
                        </Button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={selectedUser}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Usuario"
                message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
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
