const express = require('express');
const router = express.Router();
const {
  createCase,
  joinCase,
  getCases,
  getCase,
  updateCase,
  cancelCase,
  submitClaim,
  appealVerdict
} = require('../controllers/caseController');
const { protect, canAccessCase } = require('../middlewares/auth');
const {
  validateCaseCreation,
  validateCaseId,
  validateSubmission,
  validateAppeal,
  validatePagination
} = require('../middlewares/validation');

// All routes are protected
router.use(protect);

// Case management routes
router.post('/', validateCaseCreation, createCase);
router.get('/', validatePagination, getCases);
router.get('/:caseId', validateCaseId, canAccessCase, getCase);
router.put('/:caseId', validateCaseId, canAccessCase, updateCase);
router.delete('/:caseId', validateCaseId, canAccessCase, cancelCase);

// Case participation routes
router.post('/join/:token', joinCase);
router.post('/:caseId/submit', validateCaseId, canAccessCase, validateSubmission, submitClaim);
router.post('/:caseId/appeal', validateCaseId, canAccessCase, validateAppeal, appealVerdict);

module.exports = router;
