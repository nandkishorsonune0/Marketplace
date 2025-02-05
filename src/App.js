import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import ProductDetails from './pages/Products/ProductDetails';
import Categories from './pages/Categories';
import AddCategory from './pages/Categories/AddCategory';
import EditCategory from './pages/Categories/EditCategory';
import CategoryDetails from './pages/Categories/CategoryDetails';
import Orders from './pages/Orders';
import OrderDetails from './pages/Orders/OrderDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/Customers/CustomerDetails';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import { selectUser } from './features/auth/authSlice';

function App() {
    const user = useSelector(selectUser);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                user ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="/register" element={
                user ? <Navigate to="/dashboard" replace /> : <Register />
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* Default route - redirect based on role */}
                <Route index element={
                    user?.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/products" replace />
                } />

                {/* Dashboard - Admin Only */}
                <Route path="dashboard" element={
                    user?.role === 'admin' ? <Dashboard /> : <Navigate to="/products" replace />
                } />

                {/* Products */}
                <Route path="products" element={<Products />} />
                <Route path="products/add" element={
                    user?.role === 'admin' || user?.role === 'seller' ? <AddProduct /> : <Navigate to="/products" replace />
                } />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="products/:id/edit" element={
                    user?.role === 'admin' || user?.role === 'seller' ? <EditProduct /> : <Navigate to="/products" replace />
                } />

                {/* Categories */}
                <Route path="categories" element={<Categories />} />
                <Route path="categories/add" element={
                    user?.role === 'admin' ? <AddCategory /> : <Navigate to="/categories" replace />
                } />
                <Route path="categories/:id" element={<CategoryDetails />} />
                <Route path="categories/:id/edit" element={
                    user?.role === 'admin' ? <EditCategory /> : <Navigate to="/categories" replace />
                } />

                {/* Orders */}
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetails />} />

                {/* Customers - Admin Only */}
                <Route path="customers" element={
                    user?.role === 'admin' ? <Customers /> : <Navigate to="/products" replace />
                } />
                <Route path="customers/:id" element={
                    user?.role === 'admin' ? <CustomerDetails /> : <Navigate to="/products" replace />
                } />

                {/* Analytics - Admin and Seller */}
                <Route path="analytics" element={
                    user?.role === 'admin' || user?.role === 'seller' ? <Analytics /> : <Navigate to="/products" replace />
                } />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
