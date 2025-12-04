import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Category } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import { CategoryModal } from './CategoryModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SuccessModal } from '../../../components/common/SuccessModal';
import './Categories.css';

export const CategoryList: React.FC = () => {
    const { categories, deleteCategory, refreshCategories } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshCategories();
    }, []);

    useEffect(() => {
        const filtered = categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
    }, [categories, searchTerm]);

    const handleOpenModal = (category?: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedCategory(undefined);
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
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            try {
                await deleteCategory(categoryToDelete);
                handleSuccess('Categoría eliminada correctamente');
            } catch (error) {
                handleError('Error al eliminar la categoría. Por favor intente nuevamente.');
            } finally {
                setCategoryToDelete(null);
            }
        }
    };

    const totalCategories = categories.length;

    return (
        <div className="categories-container">
            <div className="categories-header">
                <div>
                    <h1 className="categories-title">Categorías</h1>
                    <p className="categories-subtitle">Organiza y clasifica las tareas del sistema.</p>
                </div>
                <Button onClick={() => handleOpenModal()} size="lg" className="btn-new-category">
                    <Plus size={20} className="mr-2" />
                    Nueva Categoría
                </Button>
            </div>

            <div className="categories-stats-grid">
                {[
                    { icon: Tag, label: 'Total Categorías', value: totalCategories, color: 'text-gray-900', bg: 'bg-gray-50 dark:bg-gray-900/20' },
                ].map((stat, idx) => (
                    <div key={idx} className="categories-stat-card group">
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

            <div className="categories-search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="categories-grid">
                {filteredCategories.map((category, index) => (
                    <div
                        key={category.id || index}
                        onClick={() => handleOpenModal(category)}
                        className="category-card group"
                    >
                        <div className="category-card-content">
                            <div className="category-card-header">
                                <div className="category-icon-box">
                                    <Tag size={24} />
                                </div>
                            </div>

                            <div className="category-info">
                                <h3 className="category-name">{category.name}</h3>
                            </div>

                            <div className="category-actions-overlay">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(category); }}
                                    className="category-action-btn"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(category.id, e)}
                                    className="category-action-btn delete"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="categories-empty-state">
                    <div className="empty-icon-circle">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                        No hay categorías que coincidan con tu búsqueda o aún no has creado ninguna.
                    </p>
                    <Button onClick={() => setSearchTerm('')} variant="secondary">
                        Limpiar Búsqueda
                    </Button>
                </div>
            )}

            {isModalOpen && (
                <CategoryModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    category={selectedCategory}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Categoría"
                message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
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
