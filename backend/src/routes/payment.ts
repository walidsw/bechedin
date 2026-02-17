import { Router, Request, Response } from 'express';
import SSLCommerzPayment from 'sslcommerz-lts';
import { adminDb } from '../lib/firebase-admin';

const router = Router();

const store_id = process.env.SSLC_STORE_ID || '';
const store_passwd = process.env.SSLC_STORE_PASSWORD || '';
const is_live = false; // Sandbox mode

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fine-entry-475306-b5.web.app';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// POST /api/payment/init
// Buyer calls this to start a payment
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    // Read order from Firestore
    const orderSnap = await adminDb.collection('orders').doc(orderId).get();
    if (!orderSnap.exists) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orderSnap.data()!;
    if (order.status !== 'pending') {
      res.status(400).json({ error: `Order is already ${order.status}` });
      return;
    }

    const tran_id = `BDIN_${orderId}_${Date.now()}`;

    const data = {
      total_amount: order.priceBdt,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${BACKEND_URL}/api/payment/success`,
      fail_url: `${BACKEND_URL}/api/payment/fail`,
      cancel_url: `${BACKEND_URL}/api/payment/cancel`,
      ipn_url: `${BACKEND_URL}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: order.listingTitle || 'Bechedin Purchase',
      product_category: 'Marketplace',
      product_profile: 'general',
      cus_name: order.buyerName || 'Buyer',
      cus_email: 'buyer@bechedin.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      ship_name: 'N/A',
      ship_add1: 'N/A',
      ship_city: 'N/A',
      ship_state: 'N/A',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      value_a: orderId, // Pass orderId in custom field
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      // Save transaction ID to order
      await adminDb.collection('orders').doc(orderId).update({
        transactionId: tran_id,
      });
      res.json({ url: apiResponse.GatewayPageURL });
    } else {
      console.error('SSLCommerz init failed:', apiResponse);
      res.status(500).json({ error: 'Payment gateway error' });
    }
  } catch (err: any) {
    console.error('Payment init error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/payment/success
// SSLCommerz redirects here after successful payment
router.post('/success', async (req: Request, res: Response) => {
  try {
    const { val_id, tran_id, value_a: orderId } = req.body;

    if (!orderId) {
      res.redirect(`${FRONTEND_URL}/payment/result?status=error&msg=Missing+order+ID`);
      return;
    }

    // Validate the transaction with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation?.status === 'VALID' || validation?.status === 'VALIDATED') {
      // Update order status to 'paid'
      await adminDb.collection('orders').doc(orderId).update({
        status: 'paid',
        paymentValidationId: val_id,
        paidAt: new Date(),
      });
      res.redirect(`${FRONTEND_URL}/escrow/${orderId}?payment=success`);
    } else {
      res.redirect(`${FRONTEND_URL}/escrow/${orderId}?payment=failed&msg=Validation+failed`);
    }
  } catch (err: any) {
    console.error('Payment success handler error:', err);
    res.redirect(`${FRONTEND_URL}/payment/result?status=error&msg=${encodeURIComponent(err.message)}`);
  }
});

// POST /api/payment/fail
router.post('/fail', async (req: Request, res: Response) => {
  const orderId = req.body.value_a;
  res.redirect(`${FRONTEND_URL}/escrow/${orderId || ''}?payment=failed`);
});

// POST /api/payment/cancel
router.post('/cancel', async (req: Request, res: Response) => {
  const orderId = req.body.value_a;
  res.redirect(`${FRONTEND_URL}/escrow/${orderId || ''}?payment=cancelled`);
});

// POST /api/payment/ipn (Instant Payment Notification - server-to-server)
router.post('/ipn', async (req: Request, res: Response) => {
  try {
    const { val_id, value_a: orderId } = req.body;
    if (!orderId || !val_id) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation?.status === 'VALID' || validation?.status === 'VALIDATED') {
      await adminDb.collection('orders').doc(orderId).update({
        status: 'paid',
        paymentValidationId: val_id,
        paidAt: new Date(),
      });
    }
    res.status(200).json({ message: 'IPN received' });
  } catch (err: any) {
    console.error('IPN error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
