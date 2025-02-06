import React, { useState } from 'react';
import { productAPI } from '../services/api';

const ImageUpload = ({ onImageUpload, initialImage }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(initialImage || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size should not exceed 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            setSelectedFile(file);
            setError(null);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await productAPI.uploadImage(formData);
            console.log('Upload response:', response);
            
            // The backend sends response in ApiResponse format
            // data property contains the actual response data
            const imageUrl = response.data?.data?.imageUrl;
            
            if (imageUrl) {
                onImageUpload(imageUrl);
                setSelectedFile(null);
                setError(null);
            } else {
                console.error('Invalid response structure:', response.data);
                throw new Error('Could not get image URL from server response');
            }
        } catch (err) {
            console.error('Upload error details:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error uploading image';
            setError(errorMessage);
            // Clear the selected file on error
            setSelectedFile(null);
            setPreview(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4">
                <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
                />
                
                {selectedFile && (
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Uploading...' : 'Upload Image'}
                    </button>
                )}
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            {(preview || initialImage) && (
                <div className="mt-4">
                    <img
                        src={preview || initialImage}
                        alt="Preview"
                        className="max-w-xs h-auto rounded-lg shadow-md"
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUpload; 