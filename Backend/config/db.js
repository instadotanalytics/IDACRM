import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
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
        
        const existingUser = await User.findOne({ email: defaultEmail });
        if (!existingUser) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
            
            await User.create({
                name: defaultName,
                email: defaultEmail,
                password: hashedPassword,
                role: 'super_admin',
                department: 'management',
                isActive: true
            });
            console.log('\n✅ ==================================');
            console.log('✅ SUPER ADMIN CREATED!');
            console.log('✅ ==================================');
            console.log(`📧 Email: ${defaultEmail}`);
            console.log(`🔑 Password: ${defaultPassword}`);
            console.log('✅ ==================================\n');
        } else {
            console.log('✅ Super Admin already exists');
        }
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
    }
};

export default connectDB;