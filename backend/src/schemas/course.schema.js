import { body } from 'express-validator';

export const createCourseSchema = [
  body('code')
    .notEmpty().withMessage('Course code is required')
    .matches(/^[A-Z]{2,4}\d{3}$/).withMessage('Course code must be like CS501'),
  body('name')
    .notEmpty().withMessage('Course name is required')
    .trim()
    .isLength({ min: 3 }).withMessage('Course name must be at least 3 characters'),
  body('description')
    .optional()
    .trim(),
  body('department')
    .notEmpty().withMessage('Department is required'),
  body('credits')
    .isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('duration')
    .notEmpty().withMessage('Duration is required'),
  body('capacity')
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),
  body('facultyId')
    .optional()
    .isUUID().withMessage('Invalid faculty ID'),
  body('startDate')
    .isISO8601().withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601().withMessage('Please provide a valid end date')
    .custom((value, { req }) => new Date(value) > new Date(req.body.startDate))
    .withMessage('End date must be after start date')
];

export const updateCourseSchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Course name must be at least 3 characters'),
  body('description')
    .optional()
    .trim(),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),
  body('facultyId')
    .optional()
    .isUUID().withMessage('Invalid faculty ID'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'COMPLETED', 'UPCOMING']).withMessage('Invalid status')
];