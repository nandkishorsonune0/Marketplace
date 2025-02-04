require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const createUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing user if exists
        await User.deleteOne({ email: 'nandkishor@gmail.com' });

        // Create new user
        const user = new User({
            name: 'Nandkishor',
            email: 'nandkishor@gmail.com',
            password: 'nandkishor',
            role: 'admin'
        });

        await user.save();
        console.log('User created successfully');
        console.log('Email: nandkishor@gmail.com');
        console.log('Password: nandkishor');

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createUser();
