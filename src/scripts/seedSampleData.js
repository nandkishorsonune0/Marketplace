const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Order = require('../models/order.model');
require('dotenv').config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Order.deleteMany({});

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin'
        });

        // Create seller user
        const sellerPassword = await bcrypt.hash('seller123', 10);
        const seller = await User.create({
            name: 'Seller User',
            email: 'seller@example.com',
            password: sellerPassword,
            role: 'seller'
        });

        // Create customer user
        const customerPassword = await bcrypt.hash('customer123', 10);
        const customer = await User.create({
            name: 'Customer User',
            email: 'customer@example.com',
            password: customerPassword,
            role: 'customer'
        });

        // Create categories
        const categories = await Category.create([
            {
                name: 'Electronics',
                description: 'Electronic devices and accessories',
                slug: 'electronics',
                createdBy: admin._id
            },
            {
                name: 'Clothing',
                description: 'Fashion and apparel',
                slug: 'clothing',
                createdBy: admin._id
            },
            {
                name: 'Books',
                description: 'Books and publications',
                slug: 'books',
                createdBy: admin._id
            }
        ]);

        // Create products
        const products = await Product.create([
            {
                name: 'Smartphone',
                description: 'Latest smartphone with advanced features',
                price: 699.99,
                category: categories[0]._id,
                seller: seller._id,
                stock: 50,
                status: 'active',
                createdBy: seller._id
            },
            {
                name: 'Laptop',
                description: 'High-performance laptop for professionals',
                price: 1299.99,
                category: categories[0]._id,
                seller: seller._id,
                stock: 30,
                status: 'active',
                createdBy: seller._id
            },
            {
                name: 'T-Shirt',
                description: 'Comfortable cotton t-shirt',
                price: 19.99,
                category: categories[1]._id,
                seller: seller._id,
                stock: 100,
                status: 'active',
                createdBy: seller._id
            },
            {
                name: 'Jeans',
                description: 'Classic blue jeans',
                price: 49.99,
                category: categories[1]._id,
                seller: seller._id,
                stock: 75,
                status: 'active',
                createdBy: seller._id
            },
            {
                name: 'Programming Book',
                description: 'Learn programming fundamentals',
                price: 39.99,
                category: categories[2]._id,
                seller: seller._id,
                stock: 25,
                status: 'active',
                createdBy: seller._id
            }
        ]);

        // Create orders with different statuses
        const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const orders = [];

        // Create multiple orders for each status
        for (let i = 0; i < 50; i++) {
            const randomProducts = [];
            const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 products per order

            for (let j = 0; j < numProducts; j++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                randomProducts.push({
                    product: randomProduct._id,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: randomProduct.price
                });
            }

            const totalAmount = randomProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
            const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // Random date within last 30 days

            orders.push({
                user: customer._id,
                items: randomProducts,
                totalAmount,
                status: randomStatus,
                paymentStatus: randomStatus === 'delivered' ? 'paid' : 'pending',
                paymentMethod: 'card',
                shippingAddress: {
                    street: '123 Main St',
                    city: 'Sample City',
                    state: 'Sample State',
                    country: 'Sample Country',
                    zipCode: '12345'
                },
                createdAt: randomDate,
                updatedAt: randomDate
            });
        }

        await Order.create(orders);

        console.log('Sample data seeded successfully');
        console.log({
            users: {
                admin: { email: 'admin@example.com', password: 'admin123' },
                seller: { email: 'seller@example.com', password: 'seller123' },
                customer: { email: 'customer@example.com', password: 'customer123' }
            },
            categoriesCreated: categories.length,
            productsCreated: products.length,
            ordersCreated: orders.length
        });

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the seed function
seedData();
