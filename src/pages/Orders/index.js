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
    Chip,
    IconButton,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
    Button,
    Checkbox,
    TableSortLabel,
    Tooltip,
    Menu
} from '@mui/material';
import {
    Visibility as ViewIcon,
    GetApp as DownloadIcon,
    FilterList as FilterIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { CSVLink } from 'react-csv';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        dateRange: 'all'
    });
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [anchorEl, setAnchorEl] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getOrders(filters);
            setOrders(response.data || []);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            setError('Failed to load orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, filters, orderBy, order]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelected(orders.map(order => order._id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Are you sure you want to delete the selected orders?')) {
            try {
                await Promise.all(selected.map(id => orderAPI.deleteOrder(id)));
                setSelected([]);
                fetchOrders();
            } catch (err) {
                setError(err.message || 'Failed to delete orders');
            }
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            processing: 'info',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'error'
        };
        return colors[status] || 'default';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportData = orders.map(order => ({
        'Order ID': order.orderNumber,
        'Date': formatDate(order.createdAt),
        'Customer': order.customer,
        'Total': `$${order.total.toFixed(2)}`,
        'Status': order.status
    }));

    return (
        <DashboardLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        Orders
                    </Typography>
                    <Box>
                        {selected.length > 0 && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleBulkDelete}
                                sx={{ mr: 2 }}
                            >
                                Delete Selected
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={handleMenuOpen}
                            sx={{ mr: 2 }}
                        >
                            Filters
                        </Button>
                        <CSVLink
                            data={exportData}
                            filename="orders.csv"
                            style={{ textDecoration: 'none' }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                            >
                                Export
                            </Button>
                        </CSVLink>
                    </Box>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <Box p={2}>
                        <Grid container spacing={2} sx={{ minWidth: 300 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Search Orders"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Order ID, Customer name..."
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={filters.status}
                                        label="Status"
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="processing">Processing</MenuItem>
                                        <MenuItem value="shipped">Shipped</MenuItem>
                                        <MenuItem value="delivered">Delivered</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Date Range</InputLabel>
                                    <Select
                                        name="dateRange"
                                        value={filters.dateRange}
                                        label="Date Range"
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="all">All Time</MenuItem>
                                        <MenuItem value="today">Today</MenuItem>
                                        <MenuItem value="week">This Week</MenuItem>
                                        <MenuItem value="month">This Month</MenuItem>
                                        <MenuItem value="year">This Year</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </Menu>

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
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < orders.length}
                                                checked={orders.length > 0 && selected.length === orders.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'orderNumber'}
                                                direction={orderBy === 'orderNumber' ? order : 'asc'}
                                                onClick={() => handleSort('orderNumber')}
                                            >
                                                Order ID
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'createdAt'}
                                                direction={orderBy === 'createdAt' ? order : 'asc'}
                                                onClick={() => handleSort('createdAt')}
                                            >
                                                Date
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'total'}
                                                direction={orderBy === 'total' ? order : 'asc'}
                                                onClick={() => handleSort('total')}
                                            >
                                                Total
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <TableRow 
                                                key={order._id}
                                                selected={selected.indexOf(order._id) !== -1}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selected.indexOf(order._id) !== -1}
                                                        onChange={() => handleSelect(order._id)}
                                                    />
                                                </TableCell>
                                                <TableCell>{order.orderNumber}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>{order.customer}</TableCell>
                                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={order.status}
                                                        color={getStatusColor(order.status)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="View">
                                                        <IconButton
                                                            component={Link}
                                                            to={`/orders/${order._id}`}
                                                            color="primary"
                                                            size="small"
                                                        >
                                                            <ViewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            component={Link}
                                                            to={`/orders/${order._id}/edit`}
                                                            color="primary"
                                                            size="small"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Download Invoice">
                                                        <IconButton
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => window.open(`/api/orders/${order._id}/invoice`, '_blank')}
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Box py={3}>
                                                    <Typography variant="body1" color="textSecondary">
                                                        No orders found
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Try adjusting your filters or search criteria
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                            <Typography variant="body2" color="textSecondary">
                                {selected.length} selected
                            </Typography>
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

export default Orders;
