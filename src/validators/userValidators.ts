import { body, param, query } from 'express-validator';

export const getUserByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

export const updateUserRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'inspector', 'viewer'])
    .withMessage('Role must be admin, inspector, or viewer'),
];

export const deleteUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

export const getUsersListValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  
  query('role')
    .optional()
    .isIn(['admin', 'inspector', 'viewer'])
    .withMessage('Role filter must be admin, inspector, or viewer'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
