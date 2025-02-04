require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const cartRoutes = require('./routes/cart.routes');

// Import middleware
const errorHandler = require('./middleware/error.middleware');
const { authenticateUser } = require('./middleware/auth.middleware');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization',
        'Cache-Control',
        'Pragma',
        'Expires'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true
}));

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes with /api/v1 prefix
const apiRouter = express.Router();

// Public routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);

// Protected routes
apiRouter.use('/users', authenticateUser, userRoutes);
apiRouter.use('/orders', authenticateUser, orderRoutes);
apiRouter.use('/dashboard', authenticateUser, dashboardRoutes);
apiRouter.use('/cart', authenticateUser, cartRoutes);

// Mount API router
app.use('/api/v1', apiRouter);

// API documentation route
app.get('/api/v1/docs', (req, res) => {
    res.json({
        message: 'API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            products: '/api/v1/products',
            categories: '/api/v1/categories',
            orders: '/api/v1/orders',
            dashboard: '/api/v1/dashboard',
            cart: '/api/v1/cart'
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Marketplace API',
        version: '1.0.0',
        documentation: '/api/v1/docs'
    });
});

// Error handling middleware
app.use(errorHandler);

// Database connection with enhanced monitoring
const connectDB = async () => {
    try {
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        console.log('Attempting to connect to MongoDB...');
        
        // Monitor MongoDB connection events
        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('❌ MongoDB disconnected');
        });

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });

        // Test the connection by running a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 Available collections:', collections.map(c => c.name).join(', ') || 'No collections found');
        
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err);
        process.exit(1);
    }
};

// Start server with connection retry
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`👉 API URL: http://localhost:${PORT}/api/v1`);
            console.log(`📝 API Documentation: http://localhost:${PORT}/api/v1/docs`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during app termination:', err);
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

startServer();
