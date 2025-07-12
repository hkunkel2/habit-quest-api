import { Router } from 'express';
import { addCategory, toggleCategoryActive, getCategories } from '../controllers/categoryController';

const router = Router();

router.put('/:id/toggleActive', toggleCategoryActive);
router.post('/create', addCategory);
router.get('/get', getCategories);

export default router;