export enum EscrowStatus {
  INITIALIZED = 'INITIALIZED',
  FUNDS_HELD = 'FUNDS_HELD',
  IN_TRANSIT = 'IN_TRANSIT',
  INSPECTING = 'INSPECTING',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface IEscrowTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  status: EscrowStatus;
  inspectionEndsAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IListing {
    id: string;
    sellerId: string;
    priceBdt: number;
    status: 'ACTIVE' | 'PENDING' | 'SOLD';
}
