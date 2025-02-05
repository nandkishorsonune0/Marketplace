import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Chip
} from '@mui/material';
import { userAPI, orderAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const CustomerDetails = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const fetchCustomerData = async () => {
        try {
            setLoading(true);
            const [customerRes, ordersRes] = await Promise.all([
                userAPI.getUser(id),
                orderAPI.getOrders({ user: id })
            ]);
            setCustomer(customerRes.data);
            setOrders(ordersRes.data.orders);
        } catch (err) {
            setError(err.message || 'Failed to fetch customer details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    if (error) {
        return (
            <DashboardLayout>
                <Container maxWidth="lg">
                    <Alert severity="error">{error}</Alert>
                </Container>
            </DashboardLayout>
        );
    }

    if (!customer) {
        return (
            <DashboardLayout>
                <Container maxWidth="lg">
                    <Alert severity="info">Customer not found</Alert>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    {/* Customer Profile */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar
                                    src={customer.avatar}
                                    alt={customer.name}
                                    sx={{ width: 100, height: 100, mb: 2 }}
                                />
                                <Typography variant="h5" gutterBottom>
                                    {customer.name}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {customer.email}
                                </Typography>
                                <Chip
                                    label={customer.status}
                                    color={customer.status === 'active' ? 'success' : 'default'}
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" color="textSecondary">
                                Member since
                            </Typography>
                            <Typography gutterBottom>
                                {formatDate(customer.createdAt)}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary">
                                Last login
                            </Typography>
                            <Typography>
                                {customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Customer Stats and Orders */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Customer Statistics
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4">
                                            {orders.length}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Total Orders
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4">
                                            ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Total Spent
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4">
                                            ${orders.length ? (orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length).toFixed(2) : '0.00'}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Average Order
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Recent Orders
                            </Typography>
                            <List>
                                {orders.map((order) => (
                                    <ListItem
                                        key={order._id}
                                        divider
                                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                        <ListItemText
                                            primary={`Order #${order._id}`}
                                            secondary={formatDate(order.createdAt)}
                                        />
                                        <Box>
                                            <Chip
                                                label={order.status}
                                                color={order.status === 'completed' ? 'success' : 'default'}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            <Typography variant="body2" component="span">
                                                ${order.totalAmount}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                ))}
                                {orders.length === 0 && (
                                    <ListItem>
                                        <ListItemText
                                            primary="No orders found"
                                            secondary="This customer hasn't placed any orders yet"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </DashboardLayout>
    );
};

export default CustomerDetails; 