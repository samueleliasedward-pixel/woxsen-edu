// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import config from '../config/env.js';

// @desc    Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          studentProfile: true,
          facultyProfile: true,
          adminProfile: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: err.message
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authorize by role (flexible)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// @desc    Check if user is student
export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student only.'
    });
  }

  next();
};

// @desc    Check if user is faculty
export const isFaculty = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'FACULTY') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty only.'
    });
  }

  next();
};

// @desc    Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }

  next();
};