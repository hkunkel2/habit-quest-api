import { Router } from 'express';
import userRoutes from './userRoutes';
import * as dns from 'dns';

const router = Router();

router.use('/api/users', userRoutes);

export default router;



