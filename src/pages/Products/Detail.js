import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../features/products/productSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const product = useSelector(state => 
        state.products.items.find(p => p._id === id)
    );
    const loading = useSelector(state => state.products.loading);
    const error = useSelector(state => state.products.error);

    useEffect(() => {
        if (!product) {
            dispatch(fetchProducts({ id }));
        }
    }, [dispatch, id, product]);

    const handleBackClick = (e) => {
        e.preventDefault();
        navigate('/products', { replace: true });
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleBackClick}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    if (!product) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={handleBackClick}
                className="mb-4 flex items-center text-primary-600 hover:text-primary-700"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Products
            </button>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        {product.image && (
                            <img
                                className="h-48 w-full object-cover md:w-48"
                                src={product.image}
                                alt={product.name}
                            />
                        )}
                    </div>
                    <div className="p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                {product.category && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Category: {product.category.name}
                                    </p>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-primary-600">
                                ${product.price.toFixed(2)}
                            </p>
                        </div>
                        
                        <p className="mt-4 text-gray-600">{product.description}</p>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Stock</p>
                                    <p className="font-medium text-gray-900">{product.stock}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">SKU</p>
                                    <p className="font-medium text-gray-900">{product.sku || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
