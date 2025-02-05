import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsAdmin } from '../../features/auth/authSlice';
import {
    Box, Container, Grid, Paper, Typography, CircularProgress, Alert, Card, CardContent, IconButton, Avatar, LinearProgress, Chip, useTheme, alpha
} from '@mui/material';
import {
    MonetizationOn as RevenueIcon,
    ShoppingCart,
    ShoppingCart as OrdersIcon,
    Inventory as ProductsIcon,
    Person as UserIcon,
    TrendingUp as TrendingUpIcon,
    MoreVert as MoreVertIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    Filler
} from 'chart.js';
import {
    fetchDashboardStats,
    fetchRevenueTrends,
    fetchRecentOrders
} from '../../features/dashboard/dashboardSlice';
import DashboardLayout from '../../components/DashboardLayout';
import { analyticsAPI } from '../../services/api';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
    const theme = useTheme();
    const isPositive = trendValue >= 0;

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                transition: 'transform 0.3s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                }
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    backgroundColor: color || theme.palette.primary.main,
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.shadows[4]
                }}
            >
                <Icon sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <CardContent sx={{ pt: 4, pb: '16px !important' }}>
                <Box sx={{ ml: 7 }}>
                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                        {value}
                    </Typography>
                    {trend && (
                        <Box display="flex" alignItems="center">
                            {isPositive ? (
                                <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: '1rem', mr: 0.5 }} />
                            ) : (
                                <ArrowDownwardIcon sx={{ color: 'error.main', fontSize: '1rem', mr: 0.5 }} />
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    color: isPositive ? 'success.main' : 'error.main',
                                    fontWeight: 'medium'
                                }}
                            >
                                {Math.abs(trendValue)}% {trend}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

const StatusChip = ({ status }) => {
    const theme = useTheme();
    const statusConfig = {
        pending: {
            icon: PendingIcon,
            color: theme.palette.warning.main,
            label: 'Pending'
        },
        processing: {
            icon: TimelineIcon,
            color: theme.palette.info.main,
            label: 'Processing'
        },
        shipped: {
            icon: ShippingIcon,
            color: theme.palette.success.light,
            label: 'Shipped'
        },
        delivered: {
            icon: CheckCircleIcon,
            color: theme.palette.success.main,
            label: 'Delivered'
        },
        cancelled: {
            icon: CancelIcon,
            color: theme.palette.error.main,
            label: 'Cancelled'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <Chip
            icon={<Icon sx={{ fontSize: '1rem !important' }} />}
            label={config.label}
            sx={{
                backgroundColor: alpha(config.color, 0.1),
                color: config.color,
                '& .MuiChip-icon': {
                    color: 'inherit'
                }
            }}
            size="small"
        />
    );
};

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalCustomers: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            lowStockProducts: 0,
            totalCategories: 0,
            monthlyGrowth: 0,
            conversionRate: 0,
            activeUsers: 0,
            customerSatisfaction: 0,
            orderStatusCounts: {
                pending: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            }
        },
        revenueData: {
            labels: [],
            values: []
        },
        categoryDistribution: {
            labels: [],
            values: []
        },
        orderStatus: {
            labels: [],
            values: []
        },
        topProducts: [],
        recentOrders: [],
        customerActivity: {
            labels: [],
            values: []
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('week');
    const user = useSelector(state => state.auth.user);
    const theme = useTheme();
    const isAdmin = useSelector(selectIsAdmin);

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                stats,
                revenueTrends,
                categoryDist,
                orderStatusDist,
                topProds,
                recentOrds,
                customerAct
            ] = await Promise.all([
                analyticsAPI.getDashboardStats(),
                analyticsAPI.getSalesTrends({ period: timeRange }),
                analyticsAPI.getCategoryDistribution(),
                analyticsAPI.getOrderStatusDistribution(),
                analyticsAPI.getTopProducts(),
                analyticsAPI.getRecentOrders(),
                analyticsAPI.getCustomerActivity()
            ]);

            setDashboardData({
                stats: stats?.data || dashboardData.stats,
                revenueData: {
                    labels: revenueTrends?.data?.labels || [],
                    values: revenueTrends?.data?.values || []
                },
                categoryDistribution: {
                    labels: categoryDist?.data?.labels || [],
                    values: categoryDist?.data?.values || []
                },
                orderStatus: {
                    labels: orderStatusDist?.data?.labels || [],
                    values: orderStatusDist?.data?.values || []
                },
                topProducts: topProds?.data || [],
                recentOrders: recentOrds?.data || [],
                customerActivity: {
                    labels: customerAct?.data?.labels || [],
                    values: customerAct?.data?.values || []
                }
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifycontent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <Container maxWidth="lg">
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                </Container>
            </DashboardLayout>
        );
    }

    const { stats } = dashboardData;

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="mt-2 text-gray-600">
                    Here's what's happening with your store today.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString() || '0'}`, icon: '💰', color: 'bg-green-100 text-green-800', trend: stats.monthlyGrowth },
                    { label: 'Total Orders', value: stats.totalOrders?.toLocaleString() || '0', icon: '📦', color: 'bg-blue-100 text-blue-800' },
                    { label: 'Total Products', value: stats.totalProducts?.toLocaleString() || '0', icon: '🏷️', color: 'bg-purple-100 text-purple-800' },
                    { label: 'Total Customers', value: stats.totalCustomers?.toLocaleString() || '0', icon: '👥', color: 'bg-yellow-100 text-yellow-800' },
                    { label: 'Average Order Value', value: `$${stats.averageOrderValue?.toLocaleString() || '0'}`, icon: '📊', color: 'bg-indigo-100 text-indigo-800' },
                    { label: 'Pending Orders', value: stats.pendingOrders?.toLocaleString() || '0', icon: '⏳', color: 'bg-red-100 text-red-800' },
                    { label: 'Low Stock Products', value: stats.lowStockProducts?.toLocaleString() || '0', icon: '⚠️', color: 'bg-orange-100 text-orange-800' },
                    { label: 'Total Categories', value: stats.totalCategories?.toLocaleString() || '0', icon: '📑', color: 'bg-teal-100 text-teal-800' },
                    { label: 'Monthly Growth', value: `${stats.monthlyGrowth?.toFixed(1) || '0'}%`, icon: '📈', color: 'bg-emerald-100 text-emerald-800' },
                    { label: 'Conversion Rate', value: `${stats.conversionRate?.toFixed(1) || '0'}%`, icon: '🎯', color: 'bg-cyan-100 text-cyan-800' },
                    { label: 'Active Users', value: stats.activeUsers?.toLocaleString() || '0', icon: '👤', color: 'bg-pink-100 text-pink-800' },
                    { label: 'Customer Satisfaction', value: `${stats.customerSatisfaction?.toFixed(1) || '0'}%`, icon: '⭐', color: 'bg-rose-100 text-rose-800' }
                ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full ${stat.color}`}>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                {stat.trend !== undefined && (
                                    <div className={`flex items-center text-sm ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.trend >= 0 ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                                        <span>{Math.abs(stat.trend).toFixed(1)}% {stat.trend >= 0 ? 'increase' : 'decrease'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Trends */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
                    {dashboardData.revenueData.labels.length > 0 ? (
                        <Line
                            data={{
                                labels: dashboardData.revenueData.labels,
                                datasets: [{
                                    label: 'Revenue',
                                    data: dashboardData.revenueData.values,
                                    borderColor: '#4F46E5',
                                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                    fill: true
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Monthly Revenue'
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (value) => `$${value.toLocaleString()}`
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">No revenue data available</p>
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
                    {dashboardData.categoryDistribution.labels.length > 0 ? (
                        <Doughnut
                            data={{
                                labels: dashboardData.categoryDistribution.labels,
                                datasets: [{
                                    data: dashboardData.categoryDistribution.values,
                                    backgroundColor: [
                                        '#4F46E5',
                                        '#10B981',
                                        '#F59E0B',
                                        '#EF4444',
                                        '#6366F1',
                                        '#8B5CF6',
                                        '#EC4899'
                                    ]
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            generateLabels: (chart) => {
                                                const data = chart.data;
                                                if (data.labels.length && data.datasets.length) {
                                                    return data.labels.map((label, i) => ({
                                                        text: `${label} (${data.datasets[0].data[i]})`,
                                                        fillStyle: data.datasets[0].backgroundColor[i],
                                                        hidden: false,
                                                        index: i
                                                    }));
                                                }
                                                return [];
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">No category data available</p>
                        </div>
                    )}
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
                    {dashboardData.orderStatus.labels.length > 0 ? (
                        <Bar
                            data={{
                                labels: dashboardData.orderStatus.labels,
                                datasets: [{
                                    label: 'Orders',
                                    data: dashboardData.orderStatus.values,
                                    backgroundColor: [
                                        '#F59E0B', // pending
                                        '#6366F1', // processing
                                        '#10B981', // shipped
                                        '#4F46E5', // delivered
                                        '#EF4444'  // cancelled
                                    ]
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
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">No order status data available</p>
                        </div>
                    )}
                </div>

                {/* Customer Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Activity</h2>
                    {dashboardData.customerActivity.labels.length > 0 ? (
                        <Line
                            data={{
                                labels: dashboardData.customerActivity.labels,
                                datasets: [{
                                    label: 'Active Users',
                                    data: dashboardData.customerActivity.values,
                                    borderColor: '#10B981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    tension: 0.4,
                                    fill: true
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
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">No activity data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                        <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm">
                            View all
                        </Link>
                    </div>
                    {dashboardData.topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.topProducts.map(product => (
                                <div key={product._id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                    <div className="flex-shrink-0 w-12 h-12">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ${product.price?.toLocaleString()} · {product.sales} sales
                                        </p>
                                    </div>
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <MoreVertIcon />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">No top products available</p>
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm">
                            View all
                        </Link>
                    </div>
                    {dashboardData.recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.recentOrders.map(order => (
                                <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                    <div>
                                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                                        <p className="text-sm text-gray-500">{order.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">${order.total?.toLocaleString()}</p>
                                        <StatusChip status={order.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-gray-500">No recent orders available</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
