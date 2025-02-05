import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { orderAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getOrder(id);
            setOrder(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
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

    if (error) {
        return (
            <DashboardLayout>
                <Container maxWidth="lg">
                    <Alert severity="error">{error}</Alert>
                </Container>
            </DashboardLayout>
        );
    }

    if (!order) {
        return (
            <DashboardLayout>
                <Container maxWidth="lg">
                    <Alert severity="info">Order not found</Alert>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Container maxWidth="lg">
                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h5">
                                    Order #{order._id}
                                </Typography>
                                <Chip
                                    label={order.status}
                                    color={getStatusColor(order.status)}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Customer Details
                            </Typography>
                            <Typography>Name: {order.user?.name}</Typography>
                            <Typography>Email: {order.user?.email}</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Shipping Details
                            </Typography>
                            <Typography>Address: {order.shippingAddress?.street}</Typography>
                            <Typography>City: {order.shippingAddress?.city}</Typography>
                            <Typography>State: {order.shippingAddress?.state}</Typography>
                            <Typography>ZIP: {order.shippingAddress?.zipCode}</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>
                            {order.items.map((item) => (
                                <Paper key={item._id} sx={{ p: 2, mb: 2 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={2}>
                                            <img
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                style={{ width: '100%', maxWidth: '80px' }}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography>{item.product?.name}</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography>Qty: {item.quantity}</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography>${item.price}</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography>${item.quantity * item.price}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">
                                    Total Amount
                                </Typography>
                                <Typography variant="h6">
                                    ${order.totalAmount}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => window.print()}
                                >
                                    Print Invoice
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </DashboardLayout>
    );
};

export default OrderDetails; 