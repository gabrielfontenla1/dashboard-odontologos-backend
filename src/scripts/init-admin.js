const mongoose = require('mongoose');
const User = require('../models/user.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function createAdmin(email, password, name) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await User.findOne({ email });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            email,
            password,
            name,
            role: 'admin',
            active: true
        });

        console.log('Admin user created successfully:', {
            email: admin.email,
            name: admin.name,
            role: admin.role
        });

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    // If no arguments provided, create default admin from .env
    createAdmin(
        process.env.ADMIN_USERNAME,
        process.env.ADMIN_PASSWORD,
        'System Administrator'
    );
} else if (args.length === 3) {
    // If arguments provided, create admin with those details
    const [email, password, name] = args;
    createAdmin(email, password, name);
} else {
    console.log('Usage: node init-admin.js [email password name]');
    console.log('If no arguments are provided, will use values from .env file');
    process.exit(1);
} 