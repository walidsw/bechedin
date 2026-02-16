import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { TrustSafetyService } from '../services/TrustSafetyService';

const router = Router();
const trustService = new TrustSafetyService();

// POST /api/nid/verify
router.post('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { nidNumber, dateOfBirth, fullName } = req.body;

    if (!nidNumber || !dateOfBirth || !fullName) {
      res.status(400).json({ error: 'nidNumber, dateOfBirth (YYYY-MM-DD), and fullName are required' });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      res.status(400).json({ error: 'dateOfBirth must be in YYYY-MM-DD format' });
      return;
    }

    const result = await trustService.verifyNid(nidNumber, dateOfBirth, fullName);

    res.json({
      verified: result.verified,
      message: result.message,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'NID verification failed' });
  }
});

export default router;
