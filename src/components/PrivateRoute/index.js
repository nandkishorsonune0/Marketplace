import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import LoadingSpinner from '../LoadingSpinner';

function PrivateRoute({ children }) {
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Show loading state while checking auth
    if (typeof isAuthenticated === 'undefined') {
        return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}

export default PrivateRoute;
