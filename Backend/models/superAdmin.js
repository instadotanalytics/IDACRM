import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const superAdminSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

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
      default: 'super_admin'
    },

    profilePicture: {
      type: String,
      default: ''
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLogin: {
      type: Date,
      default: null
    }
  },

  // =========================
  // TIMESTAMPS
  // =========================

  {
    timestamps: true
  }
);


// ====================================
// HASH PASSWORD BEFORE SAVE
// ====================================

superAdminSchema.pre('save', async function () {

  // Password modified nahi hua to skip
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt
  const salt = await bcrypt.genSalt(10);

  // Hash password
  this.password = await bcrypt.hash(
    this.password,
    salt
  );

});


// ====================================
// COMPARE PASSWORD METHOD
// ====================================

superAdminSchema.methods.comparePassword =
  async function (enteredPassword) {

    return await bcrypt.compare(
      enteredPassword,
      this.password
    );

  };


// ====================================
// REMOVE PASSWORD FROM RESPONSE
// ====================================

superAdminSchema.methods.toJSON = function () {

  const adminObject = this.toObject();

  delete adminObject.password;

  return adminObject;

};


// ====================================
// MODEL EXPORT
// ====================================

const SuperAdmin = mongoose.model(
  'SuperAdmin',
  superAdminSchema
);

export default SuperAdmin;