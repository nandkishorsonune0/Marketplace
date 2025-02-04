import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">Page Not Found</h2>
                <p className="mt-2 text-base text-gray-600">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Go back home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
