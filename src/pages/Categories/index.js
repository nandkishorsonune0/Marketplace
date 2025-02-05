import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ 
        name: '', 
        description: '',
        status: 'active',
        visibility: 'public'
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        visibility: ''
    });

    useEffect(() => {
        fetchCategories();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryAPI.getCategories(filters);
            const categoriesData = response.data?.data || response.data || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            console.log('Categories:', categoriesData);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || 'Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await categoryAPI.createCategory(newCategory);
            setShowAddModal(false);
            setNewCategory({ 
                name: '', 
                description: '',
                status: 'active',
                visibility: 'public'
            });
            await fetchCategories();
        } catch (err) {
            setError('Failed to create category');
            console.error('Error creating category:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryAPI.deleteCategory(id);
                fetchCategories();
            } catch (err) {
                setError('Failed to delete category');
                console.error('Error deleting category:', err);
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                            <p className="mt-2 text-gray-600">
                                Manage your product categories
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent 
                                     rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 
                                     hover:bg-primary-700 focus:outline-none focus:ring-2 
                                     focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Category
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search categories..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                         focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                         focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Visibility</label>
                            <select
                                name="visibility"
                                value={filters.visibility}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                         focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="">All Visibility</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(category => (
                        <div
                            key={category._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg 
                                     transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {category.name}
                                        </h3>
                                        <p className="mt-2 text-gray-600 text-sm">
                                            {category.description || 'No description'}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${category.status === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {category.status}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        {category.products?.length || 0} products
                                    </div>
                                    <span>
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => navigate(`/categories/${category._id}`)}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category._id)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {categories.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h7"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new category.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent 
                                         rounded-md shadow-sm text-sm font-medium text-white 
                                         bg-primary-600 hover:bg-primary-700 focus:outline-none 
                                         focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <svg
                                    className="-ml-1 mr-2 h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Add Category
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Category Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <div className="fixed inset-0 bg-black opacity-30"></div>
                            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                                <form onSubmit={handleAddCategory} className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Add New Category
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={newCategory.name}
                                                onChange={(e) => setNewCategory({
                                                    ...newCategory,
                                                    name: e.target.value
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                                         focus:border-primary-500 focus:ring-primary-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                value={newCategory.description}
                                                onChange={(e) => setNewCategory({
                                                    ...newCategory,
                                                    description: e.target.value
                                                })}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                                         focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Status
                                            </label>
                                            <select
                                                value={newCategory.status}
                                                onChange={(e) => setNewCategory({
                                                    ...newCategory,
                                                    status: e.target.value
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                                         focus:border-primary-500 focus:ring-primary-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Visibility
                                            </label>
                                            <select
                                                value={newCategory.visibility}
                                                onChange={(e) => setNewCategory({
                                                    ...newCategory,
                                                    visibility: e.target.value
                                                })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                                         focus:border-primary-500 focus:ring-primary-500"
                                            >
                                                <option value="public">Public</option>
                                                <option value="private">Private</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 
                                                     hover:text-gray-900"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm 
                                                     text-sm font-medium text-white bg-primary-600 
                                                     hover:bg-primary-700 focus:outline-none focus:ring-2 
                                                     focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Add Category
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Categories;
