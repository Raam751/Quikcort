const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['interpersonal', 'transactional', 'property', 'contract', 'other']
  },
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
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opposingParty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'submitted', 'resolved', 'cancelled', 'appealed'],
    default: 'pending'
  },
  invitationToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  invitationExpiry: {
    type: Date,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  verdict: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verdict'
  },
  isAppealed: {
    type: Boolean,
    default: false
  },
  appealReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
caseSchema.index({ creator: 1, status: 1 });
caseSchema.index({ opposingParty: 1, status: 1 });

// Virtual for checking if case is expired
caseSchema.virtual('isExpired').get(function () {
  return new Date() > this.deadline;
});

// Virtual for checking if invitation is expired
caseSchema.virtual('isInvitationExpired').get(function () {
  return new Date() > this.invitationExpiry;
});

// Method to check if user can submit
caseSchema.methods.canUserSubmit = function (userId) {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  return this.creator.toString() === userId.toString() ||
    this.opposingParty.toString() === userId.toString();
};

// Method to check if both parties have submitted
caseSchema.methods.areBothPartiesSubmitted = function () {
  return this.submissions && this.submissions.length >= 2;
};

// Ensure virtual fields are serialized
caseSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Case', caseSchema);
