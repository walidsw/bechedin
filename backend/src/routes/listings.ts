import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { moderationMiddleware } from '../middleware/moderation';

const router = Router();

// In-memory store
interface ListingData {
  id: string;
  sellerId: string;
  sellerPhone: string;
  categoryId: number;
  locationId: number;
  title: string;
  description: string;
  priceBdt: number;
  attributes: Record<string, any>;
  moderationStatus: string;
  images: string[];
  createdAt: Date;
}

const listings: Map<string, ListingData> = new Map();

// Seed some demo data
const seedListings = () => {
  const demoListings: ListingData[] = [
    {
      id: 'listing-001',
      sellerId: 'seller-001',
      sellerPhone: '01712345678',
      categoryId: 1,
      locationId: 1,
      title: 'iPhone 14 Pro Max - Deep Purple - 256GB',
      description: 'Used for 6 months. Battery health 94%. Comes with original box and cable. No scratches.',
      priceBdt: 115000,
      attributes: { brand: 'Apple', model: 'iPhone 14 Pro Max', storage: '256GB', condition: 'Used - Good', battery_health: '94%' },
      moderationStatus: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800'],
      createdAt: new Date('2026-02-10'),
    },
    {
      id: 'listing-002',
      sellerId: 'seller-002',
      sellerPhone: '01898765432',
      categoryId: 2,
      locationId: 3,
      title: 'Samsung Galaxy S24 Ultra - Titanium Gray',
      description: 'Brand new condition, barely used for 2 weeks. Full warranty remaining.',
      priceBdt: 135000,
      attributes: { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '512GB', condition: 'Like New' },
      moderationStatus: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800'],
      createdAt: new Date('2026-02-12'),
    },
    {
      id: 'listing-003',
      sellerId: 'seller-001',
      sellerPhone: '01712345678',
      categoryId: 3,
      locationId: 2,
      title: 'MacBook Air M2 - Midnight - 16GB/512GB',
      description: 'Perfect for students and professionals. Only 45 battery cycles. Includes charger.',
      priceBdt: 105000,
      attributes: { brand: 'Apple', model: 'MacBook Air M2', ram: '16GB', storage: '512GB', condition: 'Excellent' },
      moderationStatus: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'],
      createdAt: new Date('2026-02-14'),
    },
    {
      id: 'listing-004',
      sellerId: 'seller-003',
      sellerPhone: '01612345678',
      categoryId: 4,
      locationId: 4,
      title: 'Honda CB Hornet 160R - 2023 Model',
      description: 'Single owner. Only 8,000 km driven. All papers up to date. Tax valid until Dec 2026.',
      priceBdt: 225000,
      attributes: { brand: 'Honda', model: 'CB Hornet 160R', year: '2023', mileage: '8000 km', condition: 'Good' },
      moderationStatus: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'],
      createdAt: new Date('2026-02-15'),
    },
    {
      id: 'listing-005',
      sellerId: 'seller-004',
      sellerPhone: '01512345678',
      categoryId: 5,
      locationId: 1,
      title: 'Sony WH-1000XM5 - Silver - Wireless Headphones',
      description: 'Industry-leading noise cancellation. Purchased 3 months ago. Includes case and cable.',
      priceBdt: 28000,
      attributes: { brand: 'Sony', model: 'WH-1000XM5', color: 'Silver', condition: 'Like New' },
      moderationStatus: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'],
      createdAt: new Date('2026-02-16'),
    },
    {
      id: 'listing-006',
      sellerId: 'seller-005',
      sellerPhone: '01312345678',
      categoryId: 6,
      locationId: 5,
      title: 'IKEA KALLAX Shelf Unit - White - 4x2',
      description: 'Moving out sale. Excellent condition. Self-pickup from Uttara preferred.',
      priceBdt: 8500,
      attributes: { brand: 'IKEA', model: 'KALLAX', color: 'White', dimensions: '147x77cm', condition: 'Good' },
      moderationStatus: 'ACTIVE',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'],
      createdAt: new Date('2026-02-16'),
    },
  ];
  demoListings.forEach(l => listings.set(l.id, l));
};
seedListings();

// GET /api/listings — public, list all active listings
router.get('/', (req: Request, res: Response) => {
  const active = Array.from(listings.values())
    .filter(l => l.moderationStatus === 'ACTIVE')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json({ listings: active, total: active.length });
});

// GET /api/listings/:id — public, get single listing
router.get('/:id', (req: Request, res: Response) => {
  const listing = listings.get(req.params.id as string);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  // Add seller info (mocked)
  const sellerInfo = {
    name: 'Rahim Ahmed',
    isNidVerified: true,
    joined: 'Jan 2023',
    phone: listing.sellerPhone,
  };
  res.json({ ...listing, seller: sellerInfo });
});

// POST /api/listings — protected, create listing with moderation
router.post('/', authMiddleware, moderationMiddleware, (req: AuthRequest, res: Response) => {
  const { title, description, priceBdt, categoryId, locationId, attributes, images } = req.body;

  if (!title || !priceBdt) {
    res.status(400).json({ error: 'Title and price are required' });
    return;
  }

  const id = uuidv4();
  const listing: ListingData = {
    id,
    sellerId: req.userId!,
    sellerPhone: '01700000000',
    categoryId: categoryId || 1,
    locationId: locationId || 1,
    title,
    description: description || '',
    priceBdt,
    attributes: attributes || {},
    moderationStatus: req.body._moderationStatus || 'PENDING_MODERATION',
    images: images || [],
    createdAt: new Date(),
  };

  listings.set(id, listing);

  res.status(201).json({
    message: listing.moderationStatus === 'ACTIVE' ? 'Listing published' : 'Listing submitted for review',
    listing,
  });
});

export default router;
