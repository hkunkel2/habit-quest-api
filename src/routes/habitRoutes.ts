import { Router } from 'express';
import { getHabitsByUser, createHabit, deleteHabit, updateHabit } from '../controllers/habitController';

const router = Router();

router.post('/create', createHabit);
router.patch('/:id/update', updateHabit);
router.delete('/:id/delete', deleteHabit);
router.get('/:id/get', getHabitsByUser);

export default router;