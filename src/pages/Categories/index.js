import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    IconButton,
    Typography,
    TextField,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
} from '../../features/categories/categorySlice';

const Categories = () => {
    const dispatch = useDispatch();
    const { items: categories, loading, error, pagination } = useSelector(state => {
        console.log('Current categories state:', state.categories);
        return state.categories;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
        visibility: 'public'
    });

    const loadCategories = async () => {
        try {
            console.log('Loading categories with params:', {
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery
            });
            
            const result = await dispatch(fetchCategories({
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery
            })).unwrap();
            
            console.log('Categories loaded:', result);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [page, rowsPerPage, searchQuery]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDialog = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name || '',
                description: category.description || '',
                status: category.status || 'active',
                visibility: category.visibility || 'public'
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                name: '',
                description: '',
                status: 'active',
                visibility: 'public'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            status: 'active',
            visibility: 'public'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return;
        }

        try {
            if (selectedCategory) {
                console.log('Updating category:', {
                    id: selectedCategory._id,
                    data: formData
                });
                await dispatch(updateCategory({
                    id: selectedCategory._id,
                    categoryData: formData
                })).unwrap();
            } else {
                await dispatch(createCategory(formData)).unwrap();
            }
            handleCloseDialog();
            loadCategories(); // Refresh the list
        } catch (err) {
            console.error('Category operation failed:', err);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await dispatch(deleteCategory(id)).unwrap();
                loadCategories(); // Refresh the list
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    if (loading && !categories?.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Categories
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Category
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Visibility</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : categories && categories.length > 0 ? (
                                categories.map((category) => (
                                    <TableRow key={category?._id || 'unknown'}>
                                        <TableCell>{category?.name || 'No Name'}</TableCell>
                                        <TableCell>{category?.description || 'No Description'}</TableCell>
                                        <TableCell>{category?.status || 'active'}</TableCell>
                                        <TableCell>{category?.visibility || 'public'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog(category)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteCategory(category._id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={pagination?.total || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Category Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        label="Status"
                                    >
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Visibility</InputLabel>
                                    <Select
                                        name="visibility"
                                        value={formData.visibility}
                                        onChange={handleInputChange}
                                        label="Visibility"
                                    >
                                        <MenuItem value="public">Public</MenuItem>
                                        <MenuItem value="private">Private</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedCategory ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Categories;
