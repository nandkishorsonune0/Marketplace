require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'nandkishor@gmail.com' });
        if (existingUser) {
            console.log('Admin user already exists');
            await mongoose.disconnect();
            return;
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
        console.log('Disconnected from MongoDB');
    }
};

// Run the script
createAdminUser();
