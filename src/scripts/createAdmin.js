require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        // Delete existing admin if exists
        await User.deleteOne({ email: 'nandkishor@gmail.com' });

        // Create new admin user
        const adminUser = new User({
            name: 'Nandkishor',
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
}

createAdminUser();
