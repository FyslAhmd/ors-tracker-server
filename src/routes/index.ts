import { Router } from 'express';
import authRoutes from './authRoutes';
import orsRoutes from './orsRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ors', orsRoutes);
router.use('/users', userRoutes);

export default router;
