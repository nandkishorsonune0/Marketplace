import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Grid,
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { settingsAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import ImageUpload from '../../components/ImageUpload';

const Settings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [settings, setSettings] = useState({
        general: {
            storeName: '',
            storeEmail: '',
            storePhone: '',
            storeAddress: '',
            currency: 'USD',
            timezone: 'UTC'
        },
        notifications: {
            emailNotifications: true,
            orderUpdates: true,
            newProducts: true,
            promotions: true
        },
        security: {
            twoFactorAuth: false,
            passwordExpiry: 90,
            sessionTimeout: 30
        },
        appearance: {
            theme: 'light',
            primaryColor: '#4F46E5',
            logo: null
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsAPI.getSettings();
            if (response.data) {
                setSettings(response.data);
            }
        } catch (err) {
            setError(err.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleChange = (section, field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleLogoChange = async (logoUrl) => {
        setSettings(prev => ({
            ...prev,
            appearance: {
                ...prev.appearance,
                logo: logoUrl
            }
        }));
    };

    const handleSubmit = async (section) => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            await settingsAPI.updateSettings(section, settings[section]);
            setSuccess('Settings updated successfully');
        } catch (err) {
            setError(err.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Settings
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Paper sx={{ mt: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="General" />
                        <Tab label="Notifications" />
                        <Tab label="Security" />
                        <Tab label="Appearance" />
                    </Tabs>

                    <Box p={3}>
                        {activeTab === 0 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Store Name"
                                        value={settings.general.storeName}
                                        onChange={handleChange('general', 'storeName')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Store Email"
                                        type="email"
                                        value={settings.general.storeEmail}
                                        onChange={handleChange('general', 'storeEmail')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Store Phone"
                                        value={settings.general.storePhone}
                                        onChange={handleChange('general', 'storePhone')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Store Address"
                                        multiline
                                        rows={2}
                                        value={settings.general.storeAddress}
                                        onChange={handleChange('general', 'storeAddress')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Currency</InputLabel>
                                        <Select
                                            value={settings.general.currency}
                                            onChange={handleChange('general', 'currency')}
                                            label="Currency"
                                        >
                                            <MenuItem value="USD">USD ($)</MenuItem>
                                            <MenuItem value="EUR">EUR (€)</MenuItem>
                                            <MenuItem value="GBP">GBP (£)</MenuItem>
                                            <MenuItem value="INR">INR (₹)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Timezone</InputLabel>
                                        <Select
                                            value={settings.general.timezone}
                                            onChange={handleChange('general', 'timezone')}
                                            label="Timezone"
                                        >
                                            <MenuItem value="UTC">UTC</MenuItem>
                                            <MenuItem value="EST">EST</MenuItem>
                                            <MenuItem value="PST">PST</MenuItem>
                                            <MenuItem value="IST">IST</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSubmit('general')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save General Settings'}
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 1 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.notifications.emailNotifications}
                                                onChange={handleChange('notifications', 'emailNotifications')}
                                            />
                                        }
                                        label="Email Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.notifications.orderUpdates}
                                                onChange={handleChange('notifications', 'orderUpdates')}
                                            />
                                        }
                                        label="Order Updates"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.notifications.newProducts}
                                                onChange={handleChange('notifications', 'newProducts')}
                                            />
                                        }
                                        label="New Product Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.notifications.promotions}
                                                onChange={handleChange('notifications', 'promotions')}
                                            />
                                        }
                                        label="Promotional Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSubmit('notifications')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Notification Settings'}
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 2 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.security.twoFactorAuth}
                                                onChange={handleChange('security', 'twoFactorAuth')}
                                            />
                                        }
                                        label="Two-Factor Authentication"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Password Expiry (days)"
                                        value={settings.security.passwordExpiry}
                                        onChange={handleChange('security', 'passwordExpiry')}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Session Timeout (minutes)"
                                        value={settings.security.sessionTimeout}
                                        onChange={handleChange('security', 'sessionTimeout')}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSubmit('security')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Security Settings'}
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 3 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Theme</InputLabel>
                                        <Select
                                            value={settings.appearance.theme}
                                            onChange={handleChange('appearance', 'theme')}
                                            label="Theme"
                                        >
                                            <MenuItem value="light">Light</MenuItem>
                                            <MenuItem value="dark">Dark</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Primary Color"
                                        type="color"
                                        value={settings.appearance.primaryColor}
                                        onChange={handleChange('appearance', 'primaryColor')}
                                        InputProps={{ sx: { height: 56 } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Store Logo
                                    </Typography>
                                    <ImageUpload
                                        initialImage={settings.appearance.logo}
                                        onImageUpload={handleLogoChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSubmit('appearance')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Appearance Settings'}
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Paper>
            </Container>
        </DashboardLayout>
    );
};

export default Settings;
