import { Router } from 'express';
import { getHabitsByUser, createHabit, deleteHabit, updateHabit } from '../controllers/habitController';
import { updateHabitStatus, getHabitStreaks, completeHabitTask } from '../controllers/streakController';

const router = Router();

router.post('/create', createHabit);
router.patch('/:id/update', updateHabit);
router.delete('/:id/delete', deleteHabit);
router.get('/:id/get', getHabitsByUser);
router.post('/users/:userId/status', updateHabitStatus);
router.get('/users/:userId/streaks', getHabitStreaks);
router.patch('/task/:id/complete', completeHabitTask);

export default router;