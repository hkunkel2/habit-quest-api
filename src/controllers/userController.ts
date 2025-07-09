import { Request, Response } from 'express';
import * as userDB from '../db/user';
import { generateToken } from '../auth/jwt';
import bcrypt from 'bcryptjs';
import { loginSchema, signUpSchema } from '../validators/userValidators';

export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = signUpSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const user = await userDB.createUser(email!, username!, hashedPassword);
    const token = generateToken({ id: user.id, email: user.email });
    res.status(201).json({ message: 'User created', token });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = loginSchema.parse(req.body);

    const user = email
      ? await userDB.findUserByEmail(email.trim())
      : await userDB.findUserByUsername(username!.trim());

    if (!user) throw new Error('Invalid credentials');
    if (!user.password) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password.trim(), user.password.trim());
    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateToken({ id: user.id, email: user.email });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful' });
};