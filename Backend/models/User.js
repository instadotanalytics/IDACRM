import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin_manager', 'sales_executive', 'hr_executive', 'trainer', 'counselor', 'student'],
        required: true,
        default: 'sales_executive'
    },
    department: {
        type: String,
        enum: ['management', 'sales', 'hr', 'training', 'counseling', 'student'],  // ✅ 'student' added here
        default: 'sales'
    },
    phone: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // For trainer batch assignments
    assignedBatches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    }]
}, { timestamps: true });

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    if (!enteredPassword || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model('User', userSchema);
export default User;