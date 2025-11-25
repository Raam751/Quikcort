const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claim: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  evidence: [{
    type: {
      type: String,
      enum: ['document', 'image', 'video', 'audio', 'link', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  supportingDocuments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isCreator: {
    type: Boolean,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    previousClaim: String,
    editReason: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ submitter: 1, submittedAt: -1 });

// Virtual for evidence count
submissionSchema.virtual('evidenceCount').get(function() {
  return this.evidence ? this.evidence.length : 0;
});

// Method to add evidence
submissionSchema.methods.addEvidence = function(evidenceData) {
  if (!this.evidence) {
    this.evidence = [];
  }
  this.evidence.push(evidenceData);
  return this.save();
};

// Method to remove evidence
submissionSchema.methods.removeEvidence = function(evidenceId) {
  if (!this.evidence) return false;
  this.evidence = this.evidence.filter(ev => ev._id.toString() !== evidenceId);
  return this.save();
};

// Method to edit submission
submissionSchema.methods.editSubmission = function(newClaim, editReason) {
  if (this.isEdited) {
    this.editHistory.push({
      editedAt: new Date(),
      previousClaim: this.claim,
      editReason: editReason || 'No reason provided'
    });
  }
  
  this.claim = newClaim;
  this.isEdited = true;
  return this.save();
};

// Ensure virtual fields are serialized
submissionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
