import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    CogIcon, 
    ViewGridIcon, 
    ViewListIcon 
} from '@heroicons/react/24/outline';
import { 
    fetchCategories, 
    updateCategorySettings 
} from '../../features/categories/categorySlice';
import { selectIsAdmin } from '../../features/auth/authSlice';

function CategorySettings() {
    const dispatch = useDispatch();
    const categories = useSelector(state => state.categories.items);
    const isAdmin = useSelector(selectIsAdmin);
    
    const [viewMode, setViewMode] = useState('grid');
    const [globalSettings, setGlobalSettings] = useState({
        defaultCategoryVisibility: 'public',
        maxCategoriesPerUser: 10,
        allowUserCategoryCreation: false,
        categoryDisplayOrder: 'alphabetical'
    });

    const [categorySettings, setCategorySettings] = useState({});

    // Fetch categories on component mount
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Handle global settings changes
    const handleGlobalSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGlobalSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle individual category settings
    const handleCategorySettingChange = (categoryId, field, value) => {
        setCategorySettings(prev => ({
            ...prev,
            [categoryId]: {
                ...(prev[categoryId] || {}),
                [field]: value
            }
        }));
    };

    // Save settings
    const handleSaveSettings = () => {
        // Dispatch global settings update
        dispatch(updateCategorySettings({
            global: globalSettings,
            categories: categorySettings
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <CogIcon className="h-6 w-6 mr-2 text-primary-600" />
                    Category Settings
                </h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${
                            viewMode === 'grid' 
                                ? 'bg-primary-100 text-primary-600' 
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <ViewGridIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${
                            viewMode === 'list' 
                                ? 'bg-primary-100 text-primary-600' 
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <ViewListIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Global Category Settings */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Global Category Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="defaultCategoryVisibility" className="block text-sm font-medium text-gray-700">
                            Default Category Visibility
                        </label>
                        <select
                            id="defaultCategoryVisibility"
                            name="defaultCategoryVisibility"
                            value={globalSettings.defaultCategoryVisibility}
                            onChange={handleGlobalSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="restricted">Restricted</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="categoryDisplayOrder" className="block text-sm font-medium text-gray-700">
                            Category Display Order
                        </label>
                        <select
                            id="categoryDisplayOrder"
                            name="categoryDisplayOrder"
                            value={globalSettings.categoryDisplayOrder}
                            onChange={handleGlobalSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="alphabetical">Alphabetical</option>
                            <option value="custom">Custom Order</option>
                            <option value="product_count">By Product Count</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="maxCategoriesPerUser" className="block text-sm font-medium text-gray-700">
                            Max Categories Per User
                        </label>
                        <input
                            type="number"
                            id="maxCategoriesPerUser"
                            name="maxCategoriesPerUser"
                            value={globalSettings.maxCategoriesPerUser}
                            onChange={handleGlobalSettingsChange}
                            min="1"
                            max="50"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="allowUserCategoryCreation"
                            name="allowUserCategoryCreation"
                            checked={globalSettings.allowUserCategoryCreation}
                            onChange={handleGlobalSettingsChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowUserCategoryCreation" className="ml-2 block text-sm text-gray-900">
                            Allow User Category Creation
                        </label>
                    </div>
                </div>
            </div>

            {/* Individual Category Settings */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Individual Category Settings
                </h2>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3 gap-4' : 'grid-cols-1 gap-2'}`}>
                    {categories.map((category) => (
                        <div 
                            key={category._id} 
                            className={`
                                bg-gray-50 rounded-lg p-4 border 
                                ${viewMode === 'grid' ? 'flex-col' : 'flex items-center'}
                            `}
                        >
                            <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center'}`}>
                                <div className={`${viewMode === 'grid' ? 'mb-2' : 'mr-4'}`}>
                                    <h3 className="text-md font-semibold text-gray-800">
                                        {category.name}
                                    </h3>
                                    {viewMode === 'grid' && (
                                        <p className="text-sm text-gray-500">
                                            {category.description || 'No description'}
                                        </p>
                                    )}
                                </div>
                                
                                <div className={`
                                    flex space-x-2 
                                    ${viewMode === 'grid' ? 'mt-2' : 'ml-auto'}
                                `}>
                                    <select
                                        value={
                                            categorySettings[category._id]?.visibility || 
                                            category.visibility
                                        }
                                        onChange={(e) => 
                                            handleCategorySettingChange(
                                                category._id, 
                                                'visibility', 
                                                e.target.value
                                            )
                                        }
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="restricted">Restricted</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Display Order"
                                        value={
                                            categorySettings[category._id]?.displayOrder ?? 
                                            category.displayOrder
                                        }
                                        onChange={(e) => 
                                            handleCategorySettingChange(
                                                category._id, 
                                                'displayOrder', 
                                                Number(e.target.value)
                                            )
                                        }
                                        className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Settings Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Save Category Settings
                </button>
            </div>
        </div>
    );
}

export default CategorySettings;
