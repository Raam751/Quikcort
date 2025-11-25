const Verdict = require('../models/Verdict');
const Case = require('../models/Case');
const { asyncHandler } = require('../middlewares/errorHandler');

// @desc    Get verdict for a case
// @route   GET /api/verdicts/case/:caseId
// @access  Private
const getVerdictByCase = asyncHandler(async (req, res) => {
  const verdict = await Verdict.findOne({ case: req.params.caseId })
    .populate('case', 'title caseId status')
    .populate('winner', 'firstName lastName email')
    .populate('loser', 'firstName lastName email');

  if (!verdict) {
    return res.status(404).json({
      success: false,
      message: 'No verdict found for this case'
    });
  }

  res.status(200).json({
    success: true,
    data: { verdict }
  });
});

// @desc    Get all verdicts for user
// @route   GET /api/verdicts
// @access  Private
const getUserVerdicts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Find verdicts where user is either winner or loser
  const verdicts = await Verdict.find({
    $or: [
      { winner: req.user._id },
      { loser: req.user._id }
    ]
  })
    .populate('case', 'title caseId category amount currency')
    .populate('winner', 'firstName lastName')
    .populate('loser', 'firstName lastName')
    .sort({ generatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Verdict.countDocuments({
    $or: [
      { winner: req.user._id },
      { loser: req.user._id }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      verdicts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get verdict statistics
// @route   GET /api/verdicts/stats
// @access  Private
const getVerdictStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user's verdict statistics
  const totalVerdicts = await Verdict.countDocuments({
    $or: [{ winner: userId }, { loser: userId }]
  });

  const wonVerdicts = await Verdict.countDocuments({ winner: userId });
  const lostVerdicts = await Verdict.countDocuments({ loser: userId });

  // Get average confidence scores
  const verdictsAsWinner = await Verdict.find({ winner: userId }).select('confidenceScore');
  const verdictsAsLoser = await Verdict.find({ loser: userId }).select('confidenceScore');

  const avgConfidenceWhenWon = verdictsAsWinner.length > 0
    ? verdictsAsWinner.reduce((sum, v) => sum + v.confidenceScore, 0) / verdictsAsWinner.length
    : 0;

  const avgConfidenceWhenLost = verdictsAsLoser.length > 0
    ? verdictsAsLoser.reduce((sum, v) => sum + v.confidenceScore, 0) / verdictsAsLoser.length
    : 0;

  // Get recent verdicts (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentVerdicts = await Verdict.countDocuments({
    $or: [{ winner: userId }, { loser: userId }],
    generatedAt: { $gte: thirtyDaysAgo }
  });

  // Get user details for credibility score
  const user = await require('../models/User').findById(userId);

  const stats = {
    totalCases: totalVerdicts,
    wonCases: wonVerdicts,
    lostCases: lostVerdicts,
    credibilityScore: user ? user.credibilityScore : 0,
    winRate: totalVerdicts > 0 ? (wonVerdicts / totalVerdicts * 100).toFixed(1) : 0,
    avgConfidenceWhenWon: avgConfidenceWhenWon.toFixed(1),
    avgConfidenceWhenLost: avgConfidenceWhenLost.toFixed(1),
    recentVerdicts
  };

  res.status(200).json({
    success: true,
    data: { stats }
  });
});

// @desc    Get verdict details
// @route   GET /api/verdicts/:verdictId
// @access  Private
const getVerdictDetails = asyncHandler(async (req, res) => {
  const verdict = await Verdict.findById(req.params.verdictId)
    .populate('case', 'title caseId description category amount currency')
    .populate('winner', 'firstName lastName email credibilityScore')
    .populate('loser', 'firstName lastName email credibilityScore');

  if (!verdict) {
    return res.status(404).json({
      success: false,
      message: 'Verdict not found'
    });
  }

  // Check if user has access to this verdict
  const caseDoc = await Case.findById(verdict.case._id);
  const hasAccess = caseDoc.creator.toString() === req.user._id.toString() ||
    caseDoc.opposingParty.toString() === req.user._id.toString();

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this verdict'
    });
  }

  res.status(200).json({
    success: true,
    data: { verdict }
  });
});

// @desc    Mark verdict as final (for cases where appeal period has expired)
// @route   PUT /api/verdicts/:verdictId/finalize
// @access  Private
const finalizeVerdict = asyncHandler(async (req, res) => {
  const verdict = await Verdict.findById(req.params.verdictId);

  if (!verdict) {
    return res.status(404).json({
      success: false,
      message: 'Verdict not found'
    });
  }

  // Check if user has permission to finalize (only case participants)
  const caseDoc = await Case.findById(verdict.case);
  const hasPermission = caseDoc.creator.toString() === req.user._id.toString() ||
    caseDoc.opposingParty.toString() === req.user._id.toString();

  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to finalize this verdict'
    });
  }

  // Check if appeal period has expired
  if (!verdict.isAppealExpired) {
    return res.status(400).json({
      success: false,
      message: 'Appeal period has not yet expired'
    });
  }

  // Mark as final
  await verdict.markAsFinal();

  res.status(200).json({
    success: true,
    message: 'Verdict has been finalized'
  });
});

module.exports = {
  getVerdictByCase,
  getUserVerdicts,
  getVerdictStats,
  getVerdictDetails,
  finalizeVerdict
};
