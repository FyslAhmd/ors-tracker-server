import express from 'express';
import {
  getORSPlans,
  getORSPlan,
  createORSPlan,
  updateORSPlan,
  deleteORSPlan,
  getORSStats,
} from '../controllers/orsController';
import { protect, validate, inspectorOrAdmin, adminOnly } from '../middlewares';
import {
  createORSValidation,
  updateORSValidation,
  getORSByIdValidation,
  getORSListValidation,
} from '../validators';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id to avoid conflict)
router.get('/stats', getORSStats);

// CRUD routes
router.get('/', validate(getORSListValidation), getORSPlans);
router.get('/:id', validate(getORSByIdValidation), getORSPlan);
router.post('/', inspectorOrAdmin, validate(createORSValidation), createORSPlan);
router.put('/:id', inspectorOrAdmin, validate(updateORSValidation), updateORSPlan);
router.delete('/:id', adminOnly, validate(getORSByIdValidation), deleteORSPlan);

export default router;
