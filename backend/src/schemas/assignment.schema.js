import { body } from 'express-validator';

export const createAssignmentSchema = [
  body('title')
    .notEmpty().withMessage('Assignment title is required')
    .trim()
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description')
    .optional()
    .trim(),
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .isUUID().withMessage('Invalid course ID'),
  body('dueDate')
    .isISO8601().withMessage('Please provide a valid due date')
    .custom(value => new Date(value) > new Date())
    .withMessage('Due date must be in the future'),
  body('totalPoints')
    .isInt({ min: 1, max: 200 }).withMessage('Total points must be between 1 and 200'),
  body('weightage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100')
];

export const submitAssignmentSchema = [
  body('files')
    .optional()
    .isArray().withMessage('Files must be an array'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comments cannot exceed 1000 characters')
];

export const gradeSubmissionSchema = [
  body('score')
    .isFloat({ min: 0 }).withMessage('Score must be a positive number'),
  body('maxScore')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max score must be a positive number'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Feedback cannot exceed 2000 characters'),
  body('letterGrade')
    .optional()
    .isIn(['A', 'B', 'C', 'D', 'F', 'A+', 'A-', 'B+', 'B-', 'C+', 'C-']).withMessage('Invalid letter grade')
];