const express = require('express');
const router = express.Router();
const {
  getVerdictByCase,
  getUserVerdicts,
  getVerdictStats,
  getVerdictDetails,
  finalizeVerdict
} = require('../controllers/verdictController');
const { protect } = require('../middlewares/auth');
const {
  validateCaseId,
  validatePagination
} = require('../middlewares/validation');

// All routes are protected
router.use(protect);

// Verdict routes
router.get('/', validatePagination, getUserVerdicts);
router.get('/stats', getVerdictStats);
router.get('/case/:caseId', validateCaseId, getVerdictByCase);
router.get('/:verdictId', getVerdictDetails);
router.put('/:verdictId/finalize', finalizeVerdict);

module.exports = router;
