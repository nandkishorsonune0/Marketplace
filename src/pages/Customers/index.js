import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
    Chip,
    Avatar
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        sortBy: 'createdAt'
    });

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getUsers({
                page,
                limit: 10,
                search: filters.search,
                status: filters.status,
                sortBy: filters.sortBy
            });
            setCustomers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            setError(err.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, filters]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleDeleteCustomer = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await userAPI.deleteUser(id);
                fetchCustomers(); // Refresh the list
            } catch (err) {
                setError(err.message || 'Failed to delete customer');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Customers
                </Typography>

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Search Customers"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Name, email..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={filters.status}
                                label="Status"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                name="sortBy"
                                value={filters.sortBy}
                                label="Sort By"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="createdAt">Join Date</MenuItem>
                                <MenuItem value="name">Name</MenuItem>
                                <MenuItem value="orderCount">Orders</MenuItem>
                                <MenuItem value="totalSpent">Total Spent</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Join Date</TableCell>
                                        <TableCell>Orders</TableCell>
                                        <TableCell>Total Spent</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <TableRow key={customer._id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            src={customer.avatar}
                                                            alt={customer.name}
                                                            sx={{ mr: 2 }}
                                                        />
                                                        <Typography variant="subtitle2">
                                                            {customer.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{customer.email}</TableCell>
                                                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                                                <TableCell>{customer.orderCount || 0}</TableCell>
                                                <TableCell>${customer.totalSpent?.toFixed(2) || '0.00'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={customer.status}
                                                        color={customer.status === 'active' ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        component={Link}
                                                        to={`/customers/${customer._id}`}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        component={Link}
                                                        to={`/customers/${customer._id}/edit`}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteCustomer(customer._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        href={`mailto:${customer.email}`}
                                                    >
                                                        <EmailIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No customers found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    </>
                )}
            </Container>
        </DashboardLayout>
    );
};

export default Customers; 