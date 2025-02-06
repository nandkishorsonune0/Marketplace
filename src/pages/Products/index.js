import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        status: '',
        sort: 'newest'
    });

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching products and categories...');
            
            // Prepare query parameters
            const queryParams = {
                ...filters,
                page: 1,
                limit: 50
            };

            const [productsRes, categoriesRes] = await Promise.all([
                productAPI.getProducts(queryParams),
                categoryAPI.getCategories()
            ]);
            
            console.log('Products response:', productsRes);
            console.log('Categories response:', categoriesRes);

            // Handle products data
            let productsData;
            if (productsRes.data?.products) {
                productsData = productsRes.data.products;
            } else if (Array.isArray(productsRes.data)) {
                productsData = productsRes.data;
            } else if (productsRes.data?.data) {
                productsData = productsRes.data.data;
            } else {
                productsData = [];
            }
            
            // Handle categories data
            let categoriesData;
            if (categoriesRes.data?.categories) {
                categoriesData = categoriesRes.data.categories;
            } else if (Array.isArray(categoriesRes.data)) {
                categoriesData = categoriesRes.data;
            } else if (categoriesRes.data?.data) {
                categoriesData = categoriesRes.data.data;
            } else {
                categoriesData = [];
            }

            // Ensure we have arrays and set the state
            const validProducts = Array.isArray(productsData) ? productsData : [];
            const validCategories = Array.isArray(categoriesData) ? categoriesData : [];

            console.log('Processed products:', validProducts);
            console.log('Processed categories:', validCategories);

            setProducts(validProducts);
            setCategories(validCategories);

        } catch (err) {
            console.error('Error fetching data:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
            setError(errorMessage);
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.deleteProduct(id);
                fetchData();
            } catch (err) {
                setError('Failed to delete product');
                console.error('Error deleting product:', err);
            }
        }
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
                            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage your product catalog
                            </p>
                        </div>
                        <Link
                            to="/products/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent 
                                     rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 
                                     hover:bg-primary-700 focus:outline-none focus:ring-2 
                                     focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Product
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search products..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                         focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                         focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
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
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sort By</label>
                            <select
                                name="sort"
                                value={filters.sort}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                                         focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
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

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div
                            key={product._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg 
                                     transition-shadow duration-200"
                        >
                            <div className="aspect-w-16 aspect-h-9">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {product.status}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">
                                        ${product.price}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Stock: {product.stock}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <button
                                        onClick={() => navigate(`/products/edit/${product._id}`)}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product._id)}
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
                {products.length === 0 && !loading && (
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new product.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/products/add"
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
                                Add Product
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Products;
