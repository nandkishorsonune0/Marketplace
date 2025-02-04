import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../features/products/productSlice';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const product = useSelector(state => 
        state.products.items.find(p => p._id === id)
    );
    const user = useSelector(state => state.auth.user);
    const isAuthorized = user && (user.role === 'admin' || (product && product.seller._id === user._id));

    useEffect(() => {
        if (!product) {
            dispatch(fetchProducts({ id }));
        }
    }, [dispatch, id, product]);

    if (!product) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                
                {isAuthorized && (
                    <button
                        onClick={() => navigate(`/products/${id}/edit`)}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Product
                    </button>
                )}
            </div>

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
                                    <p className="font-medium text-gray-900">{product.sku}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
