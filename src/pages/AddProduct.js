import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductForm from '../components/ProductForm';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (productData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsAPI.createProduct(productData);
            if (response.data) {
                // Redirect to product list or product detail page
                navigate('/products');
            }
        } catch (err) {
            setError(err.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Fill in the details below to create a new product. Don't forget to add an image!
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <ProductForm 
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AddProduct; 