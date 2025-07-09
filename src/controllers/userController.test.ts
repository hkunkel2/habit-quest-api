
import request from 'supertest';
import express from 'express';
import * as userController from '../controllers/userController';
import * as userDB from '../db/user';
import bcrypt from 'bcryptjs';
import { generateToken } from '../auth/jwt';

jest.mock('../db/user');
jest.mock('../auth/jwt');

const app = express();
app.use(express.json());
app.post('/signup', userController.signUpUser);
app.post('/login', userController.loginUser);
app.post('/logout', userController.logoutUser);

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUpUser', () => {
    it('should sign up a user and return a token', async () => {
      (userDB.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });
      (generateToken as jest.Mock).mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: 'Password123!', username: 'testuser' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe('fakeToken');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app).post('/signup').send({ email: '', password: '', username: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('loginUser', () => {
    it('should login using email', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
      (userDB.findUserByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com', password: hashed });
      (generateToken as jest.Mock).mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fakeToken');
    });

    it('should login using username', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
      (userDB.findUserByUsername as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com', password: hashed });
      (generateToken as jest.Mock).mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fakeToken');
    });

    it('should return 401 on invalid credentials', async () => {
      (userDB.findUserByEmail as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });
  });

  describe('logoutUser', () => {
    it('should logout the user', async () => {
      const res = await request(app).post('/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logout successful');
    });
  });
});
