import { Router } from 'express';
import userRoutes from './userRoutes';
import habitRoutes from './habitRoutes';
import categoryRoutes from './categoryRoutes';
import friendRoutes from './friendRoutes';
import experienceRoutes from './experienceRoutes';
import leaderboardRoutes from './leaderboardRoutes';

const router = Router();

router.use('/api/users', userRoutes);
router.use('/api/habits', habitRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/friends', friendRoutes);
router.use('/api/experience', experienceRoutes);
router.use('/api/leaderboards', leaderboardRoutes);

export default router;



