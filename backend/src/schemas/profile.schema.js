import { body } from 'express-validator';

export const updateStudentProfileSchema = [
  body('program')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('year')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Semester must be between 1 and 10'),
  body('batch')
    .optional()
    .trim(),
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Please provide a valid date'),
  body('address')
    .optional()
    .trim(),
  body('emergencyContact')
    .optional()
    .isObject().withMessage('Emergency contact must be an object')
];

export const updateFacultyProfileSchema = [
  body('designation')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('qualification')
    .optional()
    .trim(),
  body('specialization')
    .optional()
    .isArray().withMessage('Specialization must be an array'),
  body('officeHours')
    .optional()
    .isObject().withMessage('Office hours must be an object'),
  body('cabin')
    .optional()
    .trim()
];