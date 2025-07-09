import { Router } from 'express';
import { signUpUser, loginUser, logoutUser } from '../controllers/userController';

const router = Router();

router.post('/signup', signUpUser);
router.post('/signin', loginUser);
router.post('/signout', logoutUser);

export default router;