require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@marketplace.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            name: 'Nandkishor Sonune',
            email: 'nandkishor@gmail.com',
            password: 'nandkishor',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: nandkishor@gmail.com');
        console.log('Password: nandkishor');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdminUser();
