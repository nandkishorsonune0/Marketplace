import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDashboardStats,
    fetchRevenueTrends,
    fetchCategoryDistribution,
    fetchOrderStatusDistribution,
    fetchTopProducts,
    fetchRecentOrders,
    fetchCustomerActivity
} from '../../features/dashboard/dashboardSlice';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const dispatch = useDispatch();
    const {
        stats,
        revenueTrends,
        categoryDistribution,
        orderStatusDistribution,
        topProducts,
        recentOrders,
        customerActivity,
        loading,
        error
    } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchRevenueTrends({ period: 'monthly' }));
        dispatch(fetchCategoryDistribution());
        dispatch(fetchOrderStatusDistribution());
        dispatch(fetchTopProducts());
        dispatch(fetchRecentOrders());
        dispatch(fetchCustomerActivity());
    }, [dispatch]);

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
                <Typography color="error" variant="h6" align="center">
                    Error: {error}
                </Typography>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Grid container spacing={3}>
                {/* Stats Overview */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {stats && Object.entries(stats).map(([key, value]) => (
                            <Grid item xs={12} sm={6} md={3} key={key}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            {typeof value === 'number' ? value.toLocaleString() : value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Revenue Trends */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Revenue Trends
                            </Typography>
                            {revenueTrends.labels.length > 0 && (
                                <LineChart
                                    width={800}
                                    height={400}
                                    data={revenueTrends.labels.map((label, index) => ({
                                        name: label,
                                        value: revenueTrends.values[index]
                                    }))}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                </LineChart>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Category Distribution
                            </Typography>
                            {categoryDistribution.labels.length > 0 && (
                                <PieChart width={400} height={400}>
                                    <Pie
                                        data={categoryDistribution.labels.map((label, index) => ({
                                            name: label,
                                            value: categoryDistribution.values[index]
                                        }))}
                                        cx={200}
                                        cy={200}
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryDistribution.labels.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Status Distribution */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Order Status Distribution
                            </Typography>
                            {orderStatusDistribution.labels.length > 0 && (
                                <PieChart width={400} height={400}>
                                    <Pie
                                        data={orderStatusDistribution.labels.map((label, index) => ({
                                            name: label,
                                            value: orderStatusDistribution.values[index]
                                        }))}
                                        cx={200}
                                        cy={200}
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {orderStatusDistribution.labels.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Products
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell align="right">Sales</TableCell>
                                            <TableCell align="right">Revenue</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topProducts.map((product) => (
                                            <TableRow key={product._id}>
                                                <TableCell component="th" scope="row">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell align="right">{product.sales}</TableCell>
                                                <TableCell align="right">
                                                    ${product.revenue.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Orders */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Orders
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Customer</TableCell>
                                            <TableCell>Products</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentOrders.map((order) => (
                                            <TableRow key={order._id}>
                                                <TableCell>{order._id}</TableCell>
                                                <TableCell>{order.customer.name}</TableCell>
                                                <TableCell>
                                                    {order.products.length} items
                                                </TableCell>
                                                <TableCell align="right">
                                                    ${order.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell>{order.status}</TableCell>
                                                <TableCell>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Customer Activity */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Customer Activity
                            </Typography>
                            {customerActivity.labels.length > 0 && (
                                <LineChart
                                    width={600}
                                    height={300}
                                    data={customerActivity.labels.map((label, index) => ({
                                        name: label,
                                        value: customerActivity.values[index]
                                    }))}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                                </LineChart>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default Dashboard; 