const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const caseRoutes = require('./cases');
const verdictRoutes = require('./verdicts');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuikCort API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/verdicts', verdictRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to QuikCort API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change user password',
        'GET /api/auth/stats': 'Get user statistics'
      },
      cases: {
        'POST /api/cases': 'Create a new case',
        'GET /api/cases': 'Get user cases',
        'GET /api/cases/:caseId': 'Get specific case',
        'PUT /api/cases/:caseId': 'Update case',
        'DELETE /api/cases/:caseId': 'Cancel case',
        'POST /api/cases/join/:token': 'Join case via invitation',
        'POST /api/cases/:caseId/submit': 'Submit claim for case',
        'POST /api/cases/:caseId/appeal': 'Appeal verdict'
      },
      verdicts: {
        'GET /api/verdicts': 'Get user verdicts',
        'GET /api/verdicts/stats': 'Get verdict statistics',
        'GET /api/verdicts/case/:caseId': 'Get verdict for case',
        'GET /api/verdicts/:verdictId': 'Get verdict details',
        'PUT /api/verdicts/:verdictId/finalize': 'Finalize verdict'
      }
    }
  });
});

module.exports = router;
