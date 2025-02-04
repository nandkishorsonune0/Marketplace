import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/Products/Detail';
import Categories from './pages/Categories';
import CategoryDetail from './pages/Categories/Detail';
import Orders from './pages/Orders';
import OrderDetail from './pages/Orders/Detail';
import Users from './pages/Users';
import UserDetail from './pages/Users/Detail';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { selectUser } from './features/auth/authSlice';
import './index.css';

function App() {
  const user = useSelector(selectUser);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        user ? <Navigate to="/products" replace /> : <Login />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/products" replace /> : <Register />
      } />

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
        <Route path="products/:id" element={<ProductDetail />} />

        {/* Categories */}
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:id" element={<CategoryDetail />} />

        {/* Orders */}
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />

        {/* Users - Admin Only */}
        <Route path="users" element={
          user?.role === 'admin' ? <Users /> : <Navigate to="/products" replace />
        } />
        <Route path="users/:id" element={
          user?.role === 'admin' ? <UserDetail /> : <Navigate to="/products" replace />
        } />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
