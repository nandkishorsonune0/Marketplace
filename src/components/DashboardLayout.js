import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const user = useSelector(state => state.auth.user);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Products', href: '/products', icon: '📦' },
        { name: 'Categories', href: '/categories', icon: '📑' },
        { name: 'Orders', href: '/orders', icon: '🛍️' },
        { name: 'Customers', href: '/customers', icon: '👥' },
        { name: 'Analytics', href: '/analytics', icon: '📈' },
        { name: 'Settings', href: '/settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 bg-primary-600">
                        <span className="text-white text-xl font-bold">Admin Dashboard</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar toggle */}
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
                 style={{ display: sidebarOpen ? 'block' : 'none' }}
                 onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile header */}
            <div className="md:hidden bg-white shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-600"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-lg font-semibold text-gray-900">Dashboard</span>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64">
                <main className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Quick Stats */}
            <div className="fixed bottom-0 right-0 p-4 md:p-6">
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="flex space-x-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Products</p>
                            <p className="text-lg font-semibold text-primary-600">150</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Orders</p>
                            <p className="text-lg font-semibold text-primary-600">24</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="text-lg font-semibold text-primary-600">$2.4k</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout; 