import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductForm from '../components/ProductForm';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productsAPI.getProductById(id);
                if (response.data) {
                    setProduct(response.data);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleSubmit = async (productData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsAPI.updateProduct(id, productData);
            if (response.data) {
                navigate('/products');
            }
        } catch (err) {
            setError(err.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !product) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                        Go back to products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <button
                        onClick={() => navigate('/products')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Back to Products
                    </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                    Update the product details below. Click save when you're done.
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
                    initialData={product}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default EditProduct; 