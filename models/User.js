const mongoose = require('mongoose');

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
  }
}, {
  timestamps: true
});

// Remove bcrypt hashing for now
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Store password as plain text temporarily
  next();
});

// Simple password comparison (remove bcrypt)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return candidatePassword === this.password;
};

module.exports = mongoose.model('User', userSchema);