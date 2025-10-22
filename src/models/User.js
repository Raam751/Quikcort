const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  credibilityScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 1000
  },
  totalCases: {
    type: Number,
    default: 0
  },
  wonCases: {
    type: Number,
    default: 0
  },
  lostCases: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update credibility score
userSchema.methods.updateCredibilityScore = function() {
  if (this.totalCases === 0) return;
  
  const winRate = this.wonCases / this.totalCases;
  const baseScore = 100;
  const bonusScore = Math.floor(winRate * 200);
  const penaltyScore = Math.floor((1 - winRate) * 100);
  
  this.credibilityScore = Math.max(0, Math.min(1000, baseScore + bonusScore - penaltyScore));
  return this.credibilityScore;
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
