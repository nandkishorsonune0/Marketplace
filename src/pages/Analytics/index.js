import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Line,
    Bar,
    Doughnut
} from 'react-chartjs-2';
import DashboardLayout from '../../components/DashboardLayout';
import { analyticsAPI } from '../../services/api';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [data, setData] = useState({
        salesTrends: {
            labels: [],
            values: []
        },
        categoryPerformance: {
            labels: [],
            values: []
        },
        customerMetrics: {
            labels: [],
            values: []
        },
        productPerformance: {
            labels: [],
            values: []
        }
    });

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [
                salesResponse,
                categoryResponse,
                customerResponse,
                productResponse
            ] = await Promise.all([
                analyticsAPI.getSalesTrends(timeRange),
                analyticsAPI.getCategoryPerformance(timeRange),
                analyticsAPI.getCustomerMetrics(timeRange),
                analyticsAPI.getProductPerformance(timeRange)
            ]);

            setData({
                salesTrends: salesResponse.data,
                categoryPerformance: categoryResponse.data,
                customerMetrics: customerResponse.data,
                productPerformance: productResponse.data
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
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
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4">Analytics</Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={handleTimeRangeChange}
                        >
                            <MenuItem value="week">Last Week</MenuItem>
                            <MenuItem value="month">Last Month</MenuItem>
                            <MenuItem value="quarter">Last Quarter</MenuItem>
                            <MenuItem value="year">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={3}>
                    {/* Sales Trends */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Sales Trends
                            </Typography>
                            <Line
                                data={{
                                    labels: data.salesTrends.labels,
                                    datasets: [{
                                        label: 'Revenue',
                                        data: data.salesTrends.values,
                                        borderColor: '#4F46E5',
                                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                        fill: true
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => `$${value}`
                                            }
                                        }
                                    }
                                }}
                            />
                        </Paper>
                    </Grid>

                    {/* Category Performance */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Category Performance
                            </Typography>
                            <Doughnut
                                data={{
                                    labels: data.categoryPerformance.labels,
                                    datasets: [{
                                        data: data.categoryPerformance.values,
                                        backgroundColor: [
                                            '#4F46E5',
                                            '#10B981',
                                            '#F59E0B',
                                            '#EF4444',
                                            '#6366F1'
                                        ]
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'right'
                                        }
                                    }
                                }}
                            />
                        </Paper>
                    </Grid>

                    {/* Customer Metrics */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Customer Metrics
                            </Typography>
                            <Bar
                                data={{
                                    labels: data.customerMetrics.labels,
                                    datasets: [{
                                        label: 'Customers',
                                        data: data.customerMetrics.values,
                                        backgroundColor: '#4F46E5'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </Paper>
                    </Grid>

                    {/* Product Performance */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Product Performance
                            </Typography>
                            <Bar
                                data={{
                                    labels: data.productPerformance.labels,
                                    datasets: [{
                                        label: 'Sales',
                                        data: data.productPerformance.values,
                                        backgroundColor: '#10B981'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    indexAxis: 'y',
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    }
                                }}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </DashboardLayout>
    );
};

export default Analytics; 