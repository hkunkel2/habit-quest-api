import { Router } from 'express';
import userRoutes from './userRoutes';
import habitRoutes from './habitRoutes';
import categoryRoutes from './categoryRoutes';

const router = Router();

router.use('/api/users', userRoutes);
router.use('/api/habits', habitRoutes);
router.use('/api/categories', categoryRoutes);

export default router;



