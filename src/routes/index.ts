import { Router } from 'express';
import userRoutes from './userRoutes';
import habitRoutes from './habitRoutes';
import categoryRoutes from './categoryRoutes';
import friendRoutes from './friendRoutes';
import experienceRoutes from './experienceRoutes';

const router = Router();

router.use('/api/users', userRoutes);
router.use('/api/habits', habitRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/friends', friendRoutes);
router.use('/api/experience', experienceRoutes);

export default router;



