import { Router } from 'express';
import { signUpUser, loginUser, logoutUser, getUsers } from '../controllers/userController';

const router = Router();

router.post('/signup', signUpUser);
router.post('/signin', loginUser);
router.get('/signout', logoutUser);
router.get('/users', getUsers);

export default router;