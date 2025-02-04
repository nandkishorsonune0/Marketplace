import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { Line, Pie, Bar } from 'react-chartjs-2';
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
    BarElement
} from 'chart.js';
import {
    fetchDashboardStats,
    fetchRevenueTrends,
    fetchRecentOrders
} from '../../features/dashboard/dashboardSlice';

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
    ArcElement
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

function Dashboard() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);
    const {
        stats,
        revenueTrends,
        recentOrders,
        loading,
        error
    } = useSelector((state) => state.dashboard);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                await dispatch(fetchDashboardStats()).unwrap();
                await dispatch(fetchRevenueTrends()).unwrap();
                await dispatch(fetchRecentOrders()).unwrap();
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            }
        };

        loadDashboardData();
    }, [dispatch]);

    if (loading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="400px"
            >
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading dashboard data...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                sx={{
                    mt: 2,
                    mx: 'auto',
                    maxWidth: 600,
                    boxShadow: theme.shadows[2]
                }}
            >
                {error}
            </Alert>
        );
    }

    if (!stats) {
        return null;
    }

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Revenue Trends',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`
                },
                grid: {
                    color: alpha(theme.palette.text.primary, 0.1)
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        elements: {
            bar: {
                borderRadius: 4,
                borderSkipped: false
            }
        }
    };

    const monthlyLabels = revenueTrends.labels.map(label => label.split('-')[1]);
    const monthlyData = revenueTrends.values;

    const barChartData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: 'Monthly Revenue',
                data: monthlyData,
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.dark,
                borderWidth: 2,
                borderRadius: 4
            },
        ],
    };

    const orderStatusColors = {
        pending: theme.palette.warning.main,
        processing: theme.palette.info.main,
        shipped: theme.palette.success.light,
        delivered: theme.palette.success.main,
        cancelled: theme.palette.error.main
    };

    const pieChartData = {
        labels: Object.keys(stats.orderStatusCounts).map(status =>
            status.charAt(0).toUpperCase() + status.slice(1)
        ),
        datasets: [
            {
                data: Object.values(stats.orderStatusCounts),
                backgroundColor: Object.values(orderStatusColors),
                borderColor: theme.palette.background.paper,
                borderWidth: 2,
            },
        ],
    };

    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: 'Order Status Distribution',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        cutout: '10%',
        animation: {
            animateScale: true,
            animateRotate: true
        }
    };

    // Calculate completion percentage for orders
    const totalOrders = Object.values(stats.orderStatusCounts).reduce((a, b) => a + b, 0);
    const completedOrders = stats.orderStatusCounts.delivered || 0;
    const completionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, bgcolor: 'background.paper', padding: 3, background: '0,0,0,0.1' }}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Welcome back! Here's what's happening with your store today.
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {/* Stats Cards */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Orders"
                            value={stats.totalOrders}
                            icon={OrdersIcon}
                            color={theme.palette.primary.main}
                            trend="this month"
                            trendValue={12.5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Products"
                            value={stats.totalProducts}
                            icon={ProductsIcon}
                            color={theme.palette.success.main}
                            trend="this month"
                            trendValue={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Revenue"
                            value={`$${stats.totalRevenue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`}
                            icon={RevenueIcon}
                            color={theme.palette.warning.main}
                            trend="this month"
                            trendValue={8.2}
                        />
                    </Grid>
                    {isAdmin && (
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Users"
                                value={stats.totalUsers}
                                icon={UserIcon}
                                color={theme.palette.info.main}
                                trend="this month"
                                trendValue={3.7}
                            />
                        </Grid>
                    )}

                    {/* Order Completion Rate */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Completion Rate
                                </Typography>
                                <Box display="flex" alignItems="center" mt={2}>
                                    <Box flex={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={completionRate}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 5,
                                                    backgroundColor: theme.palette.primary.main
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{ ml: 2, minWidth: 60 }}>
                                        {completionRate}%
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Charts */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Box>
                                        <Typography variant="h6" component="h2">
                                            Revenue Overview
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Monthly revenue performance
                                        </Typography>
                                    </Box>
                                    <IconButton size="small">
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                                <Box sx={{ height: 400 }}>
                                    <Bar options={barChartOptions} data={barChartData} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Box>
                                        <Typography variant="h5" component="h2">
                                            Order Status
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Distribution of order statuses
                                        </Typography>
                                    </Box>
                                    <IconButton size="small">
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                                <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                                    <Pie data={pieChartData} options={pieChartOptions} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Orders */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Box>
                                        <Typography variant="h6" component="h2">
                                            Recent Orders
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Latest transactions
                                        </Typography>
                                    </Box>
                                    <IconButton size="small">
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                                {recentOrders?.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {recentOrders.map((order) => (
                                            <Grid item xs={12} key={order._id}>
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: 'background.default',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateX(4px)',
                                                            boxShadow: theme.shadows[4]
                                                        }
                                                    }}
                                                >
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item xs={12} sm={3}>
                                                            <Typography variant="subtitle2" color="textSecondary">
                                                                #{order._id.slice(-8)}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="textSecondary">
                                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <StatusChip status={order.status} />
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <Typography variant="h6">
                                                                ${order.totalAmount.toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                })}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={3} textAlign="right">
                                                            <Chip
                                                                label="View Details"
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                                    }
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        py={4}
                                    >
                                        <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography color="textSecondary" align="center">
                                            No recent orders
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default Dashboard;
