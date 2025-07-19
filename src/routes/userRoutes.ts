import { Router } from 'express';
import { signUpUser, loginUser, logoutUser, getUsers, getUserProfile } from '../controllers/userController';

const router = Router();

router.post('/signup', signUpUser);
router.post('/signin', loginUser);
router.get('/signout', logoutUser);
router.get('/users', getUsers);
router.get('/:userId/me', getUserProfile);

export default router;