const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Case = require('../models/Case');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Verdict = require('../models/Verdict');
const { asyncHandler } = require('../middlewares/errorHandler');
const { generateVerdict } = require('../utils/geminiService');



// @desc    Create a new case
// @route   POST /api/cases
// @access  Private
const createCase = asyncHandler(async (req, res) => {
  const { title, description, category, amount, currency, opposingPartyEmail, deadline } = req.body;

  // Check if opposing party exists
  const opposingParty = await User.findOne({ email: opposingPartyEmail });
  if (!opposingParty) {
    return res.status(404).json({
      success: false,
      message: 'Opposing party not found. Please ask them to register first.'
    });
  }

  // Check if user is trying to create case with themselves
  if (opposingParty._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot create a case against yourself'
    });
  }

  // Generate unique case ID and invitation token
  const caseId = `QC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const invitationToken = uuidv4();

  // Set invitation expiry (7 days from now)
  const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Create case
  const newCase = await Case.create({
    caseId,
    title,
    description,
    category,
    amount: amount || 0,
    currency: currency || 'USD',
    creator: req.user._id,
    opposingParty: opposingParty._id,
    invitationToken,
    invitationExpiry,
    deadline: new Date(deadline)
  });



  await newCase.save();

  // Populate the case with user details
  await newCase.populate([
    { path: 'creator', select: 'firstName lastName email' },
    { path: 'opposingParty', select: 'firstName lastName email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Case created successfully',
    data: {
      case: newCase,
      invitationLink: `${process.env.FRONTEND_URL}/case/join/${invitationToken}`
    }
  });
});

// @desc    Join case via invitation token
// @route   POST /api/cases/join/:token
// @access  Private
const joinCase = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find case by invitation token
  const caseDoc = await Case.findOne({ invitationToken: token })
    .populate('creator', 'firstName lastName email')
    .populate('opposingParty', 'firstName lastName email');

  if (!caseDoc) {
    return res.status(404).json({
      success: false,
      message: 'Invalid invitation token'
    });
  }

  // Check if invitation is expired
  if (caseDoc.isInvitationExpired) {
    return res.status(400).json({
      success: false,
      message: 'Invitation has expired'
    });
  }

  // Check if user is the opposing party
  if (caseDoc.opposingParty._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to join this case'
    });
  }

  // Check if case is already active
  if (caseDoc.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Case is no longer available for joining'
    });
  }

  // Activate the case
  caseDoc.status = 'active';
  await caseDoc.save();

  res.status(200).json({
    success: true,
    message: 'Successfully joined the case',
    data: { case: caseDoc }
  });
});

// @desc    Get all cases for user
// @route   GET /api/cases
// @access  Private
const getCases = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = {
    $or: [
      { creator: req.user._id },
      { opposingParty: req.user._id }
    ]
  };

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  // Get cases
  const cases = await Case.find(query)
    .populate('creator', 'firstName lastName email')
    .populate('opposingParty', 'firstName lastName email')
    .populate('verdict', 'winner confidenceScore generatedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Case.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      cases,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get single case
// @route   GET /api/cases/:caseId
// @access  Private
const getCase = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.caseId)
    .populate('creator', 'firstName lastName email credibilityScore')
    .populate('opposingParty', 'firstName lastName email credibilityScore')
    .populate('submissions')
    .populate('verdict');

  if (!caseDoc) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { case: caseDoc }
  });
});

// @desc    Update case
// @route   PUT /api/cases/:caseId
// @access  Private
const updateCase = asyncHandler(async (req, res) => {
  const { title, description, amount, currency } = req.body;

  // Only creator can update case
  if (!req.isCreator) {
    return res.status(403).json({
      success: false,
      message: 'Only the case creator can update the case'
    });
  }

  // Check if case can be updated
  if (req.case.status !== 'pending' && req.case.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Case cannot be updated in its current status'
    });
  }

  const updatedCase = await Case.findByIdAndUpdate(
    req.params.caseId,
    { title, description, amount, currency },
    { new: true, runValidators: true }
  ).populate([
    { path: 'creator', select: 'firstName lastName email' },
    { path: 'opposingParty', select: 'firstName lastName email' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Case updated successfully',
    data: { case: updatedCase }
  });
});

// @desc    Cancel case
// @route   DELETE /api/cases/:caseId
// @access  Private
const cancelCase = asyncHandler(async (req, res) => {
  // Only creator can cancel case
  if (!req.isCreator) {
    return res.status(403).json({
      success: false,
      message: 'Only the case creator can cancel the case'
    });
  }

  // Check if case can be cancelled
  if (req.case.status === 'resolved' || req.case.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Case cannot be cancelled in its current status'
    });
  }

  // Update case status
  req.case.status = 'cancelled';
  await req.case.save();

  res.status(200).json({
    success: true,
    message: 'Case cancelled successfully'
  });
});

// @desc    Submit claim for case
// @route   POST /api/cases/:caseId/submit
// @access  Private
const submitClaim = asyncHandler(async (req, res) => {
  const { claim, evidence } = req.body;

  // Check if user can submit
  if (!req.case.canUserSubmit(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot submit a claim for this case at this time'
    });
  }

  // Check if user has already submitted
  const existingSubmission = await Submission.findOne({
    case: req.case._id,
    submitter: req.user._id
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted a claim for this case'
    });
  }

  // Create submission
  const submission = await Submission.create({
    case: req.case._id,
    submitter: req.user._id,
    claim,
    evidence: evidence || [],
    isCreator: req.isCreator
  });

  // Add submission to case
  req.case.submissions.push(submission._id);
  await req.case.save();

  // Check if both parties have submitted
  if (req.case.areBothPartiesSubmitted()) {
    console.log(`Both parties submitted for case ${req.case._id}. Generating verdict...`);
    req.case.status = 'submitted';
    await req.case.save();

    // Generate verdict using AI
    try {
      const verdict = await generateVerdict(req.case._id);
      console.log(`Verdict generated successfully for case ${req.case._id}`);
      req.case.verdict = verdict._id;
      req.case.status = 'resolved';
      await req.case.save();

      // Update user statistics
      await updateUserStats(verdict);
    } catch (error) {
      console.error(`Error generating verdict for case ${req.case._id}:`, error);
      // Case remains in 'submitted' status if verdict generation fails
    }
  }

  res.status(201).json({
    success: true,
    message: 'Claim submitted successfully',
    data: { submission }
  });
});

// @desc    Appeal verdict
// @route   POST /api/cases/:caseId/appeal
// @access  Private
const appealVerdict = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  // Check if case has a verdict
  if (!req.case.verdict) {
    return res.status(400).json({
      success: false,
      message: 'No verdict found for this case'
    });
  }

  const verdict = await Verdict.findById(req.case.verdict);

  // Check if user can appeal
  if (!verdict.canUserAppeal(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot appeal this verdict'
    });
  }

  // Update case and verdict
  req.case.isAppealed = true;
  req.case.appealReason = reason;
  req.case.status = 'appealed';
  await req.case.save();

  await verdict.markAsAppealed();

  res.status(200).json({
    success: true,
    message: 'Appeal submitted successfully'
  });
});

// Helper function to update user statistics
const updateUserStats = async (verdict) => {
  try {
    const winner = await User.findById(verdict.winner);
    const loser = await User.findById(verdict.loser);

    if (winner) {
      winner.totalCases += 1;
      winner.wonCases += 1;
      winner.updateCredibilityScore();
      await winner.save();
    }

    if (loser) {
      loser.totalCases += 1;
      loser.lostCases += 1;
      loser.updateCredibilityScore();
      await loser.save();
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// @desc    Retry verdict generation
// @route   POST /api/cases/:caseId/retry-verdict
// @access  Private
const retryVerdict = asyncHandler(async (req, res) => {
  // Check if case is in submitted status
  if (req.case.status !== 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'Verdict generation can only be retried for submitted cases'
    });
  }

  console.log(`Retrying verdict generation for case ${req.case._id}...`);

  try {
    const verdict = await generateVerdict(req.case._id);
    console.log(`Verdict generated successfully for case ${req.case._id}`);

    req.case.verdict = verdict._id;
    req.case.status = 'resolved';
    await req.case.save();

    // Update user statistics
    await updateUserStats(verdict);

    res.status(200).json({
      success: true,
      message: 'Verdict generated successfully',
      data: { verdict }
    });
  } catch (error) {
    console.error(`Error generating verdict for case ${req.case._id}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to generate verdict: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = {
  createCase,
  joinCase,
  getCases,
  getCase,
  updateCase,
  cancelCase,
  submitClaim,
  appealVerdict,
  retryVerdict
};
