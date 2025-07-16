import { Router } from 'express';
import userRoutes from './userRoutes';
import habitRoutes from './habitRoutes';
import categoryRoutes from './categoryRoutes';
import friendRoutes from './friendRoutes';

const router = Router();

router.use('/api/users', userRoutes);
router.use('/api/habits', habitRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/friends', friendRoutes);

export default router;



