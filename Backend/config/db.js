import mongoose from 'mongoose';
import SuperAdmin from '../models/SuperAdmin.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database: ${conn.connection.name}`);
        
        // Auto create default super admin
        await createDefaultSuperAdmin();
        
        return conn;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

const createDefaultSuperAdmin = async () => {
    try {
        const defaultEmail = process.env.DEFAULT_SUPER_ADMIN_EMAIL || 'superadmin@ida.com';
        const defaultPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD || 'admin123';
        const defaultName = process.env.DEFAULT_SUPER_ADMIN_NAME || 'Super Admin';
        
        // Check if super admin already exists
        const existingAdmin = await SuperAdmin.findOne({ email: defaultEmail });
        
        if (!existingAdmin) {
            // Create default super admin
            const superAdmin = new SuperAdmin({
                name: defaultName,
                email: defaultEmail,
                password: defaultPassword,
                role: 'super_admin',
                isActive: true
            });
            
            await superAdmin.save();
            
            console.log('\n✅ ==================================');
            console.log('✅ DEFAULT SUPER ADMIN CREATED!');
            console.log('✅ ==================================');
            console.log(`📧 Email: ${defaultEmail}`);
            console.log(`🔑 Password: ${defaultPassword}`);
            console.log(`👤 Name: ${defaultName}`);
            console.log('✅ ==================================\n');
        } else {
            console.log(`\n✅ Super Admin already exists:`);
            console.log(`📧 Email: ${defaultEmail}`);
            console.log(`✅ Status: Active\n`);
        }
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
        console.log('You can manually create super admin in MongoDB Compass');
    }
};

export default connectDB;