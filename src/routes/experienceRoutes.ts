import { Router } from 'express';
import { 
  getUserLevels, 
  getUserExperience, 
  getUserExperienceHistory, 
  getCategoryStats
} from '../controllers/experienceController';

const router = Router();

router.get('/users/:userId/levels', getUserLevels);
router.get('/users/:userId/experience', getUserExperience);
router.get('/users/:userId/experience/history', getUserExperienceHistory);
router.get('/users/:userId/categories/:categoryId/stats', getCategoryStats);

export default router;