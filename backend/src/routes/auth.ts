import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory user store (replace with Prisma when DB is connected)
interface StoredUser {
  id: string;
  phoneNumber: string;
  email?: string;
  passwordHash: string;
  nidVerified: boolean;
  roles: string[];
  createdAt: Date;
}

const users: Map<string, StoredUser> = new Map();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password, email } = req.body;

    if (!phoneNumber || !password) {
      res.status(400).json({ error: 'Phone number and password are required' });
      return;
    }

    // Check if phone already exists
    const existing = Array.from(users.values()).find(u => u.phoneNumber === phoneNumber);
    if (existing) {
      res.status(409).json({ error: 'Phone number already registered' });
      return;
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const user: StoredUser = {
      id,
      phoneNumber,
      email: email || undefined,
      passwordHash,
      nidVerified: false,
      roles: ['BUYER', 'SELLER'],
      createdAt: new Date(),
    };

    users.set(id, user);
    const token = generateToken(id, user.roles);

    res.status(201).json({
      message: 'Registration successful',
      user: { id, phoneNumber, email: user.email, nidVerified: false, roles: user.roles },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      res.status(400).json({ error: 'Phone number and password are required' });
      return;
    }

    const user = Array.from(users.values()).find(u => u.phoneNumber === phoneNumber);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.roles);
    res.json({
      message: 'Login successful',
      user: { id: user.id, phoneNumber: user.phoneNumber, email: user.email, nidVerified: user.nidVerified, roles: user.roles },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = Array.from(users.values()).find(u => u.id === req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    id: user.id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    nidVerified: user.nidVerified,
    roles: user.roles,
  });
});

export default router;
