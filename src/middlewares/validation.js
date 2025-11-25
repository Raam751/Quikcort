const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Case validation rules
const validateCaseCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('category')
    .isIn(['interpersonal', 'transactional', 'property', 'contract', 'other'])
    .withMessage('Invalid category selected'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('opposingPartyEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email for the opposing party'),
  body('deadline')
    .isISO8601()
    .withMessage('Please provide a valid deadline date')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      const maxDeadline = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      
      if (deadline <= now) {
        throw new Error('Deadline must be in the future');
      }
      if (deadline > maxDeadline) {
        throw new Error('Deadline cannot be more than 30 days in the future');
      }
      return true;
    }),
  handleValidationErrors
];

const validateCaseId = [
  param('caseId')
    .isMongoId()
    .withMessage('Invalid case ID format'),
  handleValidationErrors
];

// Submission validation rules
const validateSubmission = [
  body('claim')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Claim must be between 50 and 2000 characters'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  body('evidence.*.type')
    .optional()
    .isIn(['document', 'image', 'video', 'audio', 'link', 'other'])
    .withMessage('Invalid evidence type'),
  body('evidence.*.url')
    .optional()
    .isURL()
    .withMessage('Evidence URL must be valid'),
  body('evidence.*.description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Evidence description must be less than 200 characters'),
  handleValidationErrors
];

// Appeal validation rules
const validateAppeal = [
  body('reason')
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage('Appeal reason must be between 20 and 500 characters'),
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Search validation rules
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('category')
    .optional()
    .isIn(['interpersonal', 'transactional', 'property', 'contract', 'other'])
    .withMessage('Invalid category filter'),
  query('status')
    .optional()
    .isIn(['pending', 'active', 'submitted', 'resolved', 'cancelled', 'appealed'])
    .withMessage('Invalid status filter'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCaseCreation,
  validateCaseId,
  validateSubmission,
  validateAppeal,
  validatePagination,
  validateSearch
};
