import { body } from 'express-validator';

export const registerSchema = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('role')
    .optional()
    .isIn(['STUDENT', 'FACULTY', 'ADMIN']).withMessage('Invalid role'),
  body('studentId')
    .if(body('role').equals('STUDENT'))
    .notEmpty().withMessage('Student ID is required for students'),
  body('employeeId')
    .if(body('role').equals('FACULTY'))
    .notEmpty().withMessage('Employee ID is required for faculty'),
  body('program')
    .if(body('role').equals('STUDENT'))
    .optional()
    .trim(),
  body('year')
    .if(body('role').equals('STUDENT'))
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('semester')
    .if(body('role').equals('STUDENT'))
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Semester must be between 1 and 10')
];

export const loginSchema = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'faculty']).withMessage('Invalid role selection')
];

export const updateProfileSchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s]+$/).withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim(),
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Please provide a valid date')
];

export const changePasswordSchema = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('New password must contain at least one letter and one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match')
];

export const forgotPasswordSchema = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
];

export const resetPasswordSchema = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];