const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to access this resource.'
    });
  }
  next();
};

// Check if user owns the resource or is admin
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource.'
      });
    }

    next();
  };
};

// Check if user can access case
const canAccessCase = async (req, res, next) => {
  try {
    const Case = require('../models/Case');
    const caseId = req.params.caseId || req.params.id;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: 'Case ID is required.'
      });
    }

    const caseDoc = await Case.findById(caseId);
    
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found.'
      });
    }

    // Check if user is creator or opposing party
    const isCreator = caseDoc.creator.toString() === req.user._id.toString();
    const isOpposingParty = caseDoc.opposingParty.toString() === req.user._id.toString();

    if (!isCreator && !isOpposingParty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view this case.'
      });
    }

    req.case = caseDoc;
    req.isCreator = isCreator;
    req.isOpposingParty = isOpposingParty;
    next();
  } catch (error) {
    console.error('Case access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking case access.'
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  requireVerification,
  authorize,
  canAccessCase
};
