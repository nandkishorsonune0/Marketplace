import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';

const CategoryForm = ({ initialData, onSubmit, isEdit = false }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        status: initialData?.status || 'active',
        visibility: initialData?.visibility || 'public',
        parentCategory: initialData?.parentCategory || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await onSubmit(formData);
            setSuccess(true);
            if (!isEdit) {
                setFormData({
                    name: '',
                    description: '',
                    status: 'active',
                    visibility: 'public',
                    parentCategory: ''
                });
            }
        } catch (err) {
            setError(err.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Category {isEdit ? 'updated' : 'created'} successfully!
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
            />

            <TextField
                margin="normal"
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleChange}
                    disabled={loading}
                >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                    labelId="visibility-label"
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    label="Visibility"
                    onChange={handleChange}
                    disabled={loading}
                >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                </Select>
            </FormControl>

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
            >
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    isEdit ? 'Update Category' : 'Create Category'
                )}
            </Button>
        </Box>
    );
};

export default CategoryForm; 