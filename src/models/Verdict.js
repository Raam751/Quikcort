const mongoose = require('mongoose');

const verdictSchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
    unique: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reasoning: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000
  },
  keyPoints: [{
    point: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    supportingEvidence: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }],
  recommendedActions: [{
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  compensation: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 3
    },
    type: {
      type: String,
      enum: ['monetary', 'apology', 'action', 'none'],
      default: 'none'
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  aiModel: {
    type: String,
    default: 'gemini-pro',
    trim: true
  },
  excuse: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  isAppealed: {
    type: Boolean,
    default: false
  },
  appealDeadline: {
    type: Date,
    required: true
  },
  isFinal: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries

verdictSchema.index({ winner: 1 });
verdictSchema.index({ loser: 1 });
verdictSchema.index({ generatedAt: -1 });

// Virtual for checking if appeal period has expired
verdictSchema.virtual('isAppealExpired').get(function () {
  return new Date() > this.appealDeadline;
});

// Virtual for confidence level
verdictSchema.virtual('confidenceLevel').get(function () {
  if (this.confidenceScore >= 80) return 'high';
  if (this.confidenceScore >= 60) return 'medium';
  return 'low';
});

// Method to check if user can appeal
verdictSchema.methods.canUserAppeal = function (userId) {
  if (this.isFinal) return false;
  if (this.isAppealExpired) return false;
  return this.loser.toString() === userId.toString();
};

// Method to mark as appealed
verdictSchema.methods.markAsAppealed = function () {
  this.isAppealed = true;
  return this.save();
};

// Method to mark as final
verdictSchema.methods.markAsFinal = function () {
  this.isFinal = true;
  return this.save();
};

// Ensure virtual fields are serialized
verdictSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Verdict', verdictSchema);
