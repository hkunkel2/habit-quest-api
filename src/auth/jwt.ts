import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN_MINS || '60', 10) * 60;

const signOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
};

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}