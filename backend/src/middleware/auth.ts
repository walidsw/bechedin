import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bechedin-dev-secret-key-change-in-prod';

export interface AuthRequest extends Request {
  userId?: string;
  userRoles?: string[];
}

export function generateToken(userId: string, roles: string[] = ['BUYER']): string {
  return jwt.sign({ userId, roles }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; roles: string[] } {
  return jwt.verify(token, JWT_SECRET) as { userId: string; roles: string[] };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userRoles = decoded.roles;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
