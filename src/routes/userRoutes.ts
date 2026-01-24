import express from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getUserStats,
} from '../controllers/userController';
import { protect, validate, adminOnly } from '../middlewares';
import {
  getUserByIdValidation,
  updateUserRoleValidation,
  deleteUserValidation,
  getUsersListValidation,
} from '../validators';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Stats route
router.get('/stats', getUserStats);

// CRUD routes
router.get('/', validate(getUsersListValidation), getUsers);
router.get('/:id', validate(getUserByIdValidation), getUser);
router.put('/:id', validate(updateUserRoleValidation), updateUserRole);
router.delete('/:id', validate(deleteUserValidation), deleteUser);

export default router;
