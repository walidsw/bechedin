import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { EscrowService } from '../services/EscrowService';

const router = Router();
const escrowService = new EscrowService();

// POST /api/escrow/initiate
router.post('/initiate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      res.status(400).json({ error: 'listingId is required' });
      return;
    }
    const txn = await escrowService.initiateEscrow(listingId, req.userId!);
    res.status(201).json({ message: 'Escrow initiated', transaction: txn });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/escrow/:id/confirm-payment
router.post('/:id/confirm-payment', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const txn = await escrowService.confirmPayment(req.params.id as string);
    res.json({ message: 'Payment confirmed, funds held', transaction: txn });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/escrow/:id/courier-pickup (simulates courier webhook)
router.post('/:id/courier-pickup', async (req, res) => {
  try {
    const txn = await escrowService.courierCourierPickup(req.params.id as string);
    res.json({ message: 'Item picked up by courier', transaction: txn });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/escrow/:id/courier-delivered (webhook handler)
router.post('/:id/courier-delivered', async (req, res) => {
  try {
    const txn = await escrowService.handleCourierDelivery(req.params.id as string);
    res.json({ message: 'Item delivered. Inspection period started.', transaction: txn });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/escrow/:id/resolve
router.post('/:id/resolve', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
      res.status(400).json({ error: 'action must be ACCEPT or REJECT' });
      return;
    }
    const txn = await escrowService.resolveEscrow(req.params.id as string, action);
    res.json({ message: `Escrow ${action.toLowerCase()}ed`, transaction: txn });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/escrow/:id
router.get('/:id', async (req, res) => {
  try {
    const txn = await escrowService.getTransaction(req.params.id as string);
    if (!txn) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ transaction: txn });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
