import { body, param, query } from 'express-validator';

const scoreValidation = (field: string) =>
  body(`scores.${field}`)
    .notEmpty()
    .withMessage(`${field} score is required`)
    .isInt({ min: 0, max: 100 })
    .withMessage(`${field} score must be a number between 0 and 100`);

export const createORSValidation = [
  body('vehicleId')
    .trim()
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Vehicle ID must be between 2 and 50 characters'),
  
  body('vehicleType')
    .trim()
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['Truck', 'Van', 'Bus', 'Car', 'Motorcycle', 'Trailer', 'Heavy Equipment', 'Other'])
    .withMessage('Vehicle type must be one of: Truck, Van, Bus, Car, Motorcycle, Trailer, Heavy Equipment, Other'),
  
  body('inspectionDate')
    .notEmpty()
    .withMessage('Inspection date is required')
    .isISO8601()
    .withMessage('Inspection date must be a valid date'),
  
  body('nextInspectionDate')
    .notEmpty()
    .withMessage('Next inspection date is required')
    .isISO8601()
    .withMessage('Next inspection date must be a valid date'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status must be draft, active, completed, or archived'),
  
  body('scores')
    .notEmpty()
    .withMessage('Scores are required')
    .isObject()
    .withMessage('Scores must be an object'),
  
  scoreValidation('engine'),
  scoreValidation('brakes'),
  scoreValidation('tires'),
  scoreValidation('transmission'),
  scoreValidation('electrical'),
  scoreValidation('suspension'),
  scoreValidation('steering'),
  scoreValidation('bodyExterior'),
  scoreValidation('interior'),
  scoreValidation('safetyEquipment'),
  
  body('textDocumentation')
    .optional()
    .isObject()
    .withMessage('Text documentation must be an object'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user ID must be a valid ID'),
];

const optionalScoreValidation = (field: string) =>
  body(`scores.${field}`)
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage(`${field} score must be a number between 0 and 100`);

export const updateORSValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ORS plan ID format'),
  
  body('vehicleId')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Vehicle ID must be between 2 and 50 characters'),
  
  body('vehicleType')
    .optional()
    .trim()
    .isIn(['Truck', 'Van', 'Bus', 'Car', 'Motorcycle', 'Trailer', 'Heavy Equipment', 'Other'])
    .withMessage('Vehicle type must be one of: Truck, Van, Bus, Car, Motorcycle, Trailer, Heavy Equipment, Other'),
  
  body('inspectionDate')
    .optional()
    .isISO8601()
    .withMessage('Inspection date must be a valid date'),
  
  body('nextInspectionDate')
    .optional()
    .isISO8601()
    .withMessage('Next inspection date must be a valid date'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status must be draft, active, completed, or archived'),
  
  body('scores')
    .optional()
    .isObject()
    .withMessage('Scores must be an object'),
  
  optionalScoreValidation('engine'),
  optionalScoreValidation('brakes'),
  optionalScoreValidation('tires'),
  optionalScoreValidation('transmission'),
  optionalScoreValidation('electrical'),
  optionalScoreValidation('suspension'),
  optionalScoreValidation('steering'),
  optionalScoreValidation('bodyExterior'),
  optionalScoreValidation('interior'),
  optionalScoreValidation('safetyEquipment'),
  
  body('textDocumentation')
    .optional()
    .isObject()
    .withMessage('Text documentation must be an object'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user ID must be a valid ID'),
];

export const getORSByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ORS plan ID format'),
];

export const getORSListValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  
  query('scoreMin')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Minimum score must be between 0 and 100'),
  
  query('scoreMax')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Maximum score must be between 0 and 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status must be draft, active, completed, or archived'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'overallScore', 'vehicleId', 'inspectionDate', 'updatedAt'])
    .withMessage('Sort field must be createdAt, overallScore, vehicleId, inspectionDate, or updatedAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
