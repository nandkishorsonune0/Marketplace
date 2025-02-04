import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const settingsTabs = [
    { id: 'general', name: 'General' },
    { id: 'security', name: 'Security' },
    { id: 'notifications', name: 'Notifications' },
];

function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const formik = useFormik({
        initialValues: {
            siteName: 'My Marketplace',
            siteDescription: 'A modern e-commerce marketplace',
            supportEmail: 'support@example.com',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            emailNotifications: true,
            pushNotifications: false,
        },
        validationSchema: Yup.object().shape({
            siteName: Yup.string().required('Site name is required'),
            siteDescription: Yup.string(),
            supportEmail: Yup.string().email('Invalid email').required('Support email is required'),
            currentPassword: Yup.string().when('newPassword', {
                is: val => val && val.length > 0,
                then: Yup.string().required('Current password is required')
            }),
            newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
            confirmPassword: Yup.string().when('newPassword', {
                is: val => val && val.length > 0,
                then: Yup.string()
                    .required('Please confirm your password')
                    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
            }),
        }),
        onSubmit: (values) => {
            console.log(values);
            // Handle form submission
        },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {settingsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Settings Content */}
            <div className="mt-6">
                <form onSubmit={formik.handleSubmit}>
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    id="siteName"
                                    {...formik.getFieldProps('siteName')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {formik.touched.siteName && formik.errors.siteName && (
                                    <p className="mt-2 text-sm text-red-600">{formik.errors.siteName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                                    Site Description
                                </label>
                                <textarea
                                    id="siteDescription"
                                    rows={3}
                                    {...formik.getFieldProps('siteDescription')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
                                    Support Email
                                </label>
                                <input
                                    type="email"
                                    id="supportEmail"
                                    {...formik.getFieldProps('supportEmail')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {formik.touched.supportEmail && formik.errors.supportEmail && (
                                    <p className="mt-2 text-sm text-red-600">{formik.errors.supportEmail}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    {...formik.getFieldProps('currentPassword')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {formik.touched.currentPassword && formik.errors.currentPassword && (
                                    <p className="mt-2 text-sm text-red-600">{formik.errors.currentPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    {...formik.getFieldProps('newPassword')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {formik.touched.newPassword && formik.errors.newPassword && (
                                    <p className="mt-2 text-sm text-red-600">{formik.errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    {...formik.getFieldProps('confirmPassword')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="emailNotifications"
                                        type="checkbox"
                                        {...formik.getFieldProps('emailNotifications')}
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                                        Email Notifications
                                    </label>
                                    <p className="text-gray-500">Receive email notifications about orders and updates</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="pushNotifications"
                                        type="checkbox"
                                        {...formik.getFieldProps('pushNotifications')}
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                                        Push Notifications
                                    </label>
                                    <p className="text-gray-500">Receive push notifications about orders and updates</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;
