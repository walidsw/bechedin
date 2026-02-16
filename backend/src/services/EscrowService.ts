import { EscrowStatus, IEscrowTransaction, IListing } from '../types';

// Mock database storage
const escrowTransactions: Map<string, IEscrowTransaction> = new Map();
const listings: Map<string, IListing> = new Map();

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class EscrowService {
    
    // Seed some mock data for testing
    constructor() {
        listings.set('listing-123', {
            id: 'listing-123',
            sellerId: 'seller-456',
            priceBdt: 5000,
            status: 'ACTIVE'
        });
    }

    async initiateEscrow(listingId: string, buyerId: string): Promise<IEscrowTransaction> {
        await delay(100);
        const listing = listings.get(listingId);
        
        if (!listing) throw new Error('Listing not found');
        if (listing.status !== 'ACTIVE') throw new Error('Listing is not active');

        const transactionId = `txn-${Date.now()}`;
        const transaction: IEscrowTransaction = {
            id: transactionId,
            listingId,
            buyerId,
            sellerId: listing.sellerId,
            amount: listing.priceBdt,
            platformFee: listing.priceBdt * 0.05, // 5% fee
            status: EscrowStatus.INITIALIZED,
            createdAt: new Date(),
            updatedAt: new Date(),
            inspectionEndsAt: null
        };

        escrowTransactions.set(transactionId, transaction);
        
        // In a real DB transaction, we would lock the listing here
        listing.status = 'PENDING'; 
        
        console.log(`[Escrow] Initialized transaction ${transactionId} for listing ${listingId}`);
        return transaction;
    }

    async confirmPayment(transactionId: string): Promise<IEscrowTransaction> {
        const txn = escrowTransactions.get(transactionId);
        if (!txn) throw new Error('Transaction not found');
        
        if (txn.status !== EscrowStatus.INITIALIZED) {
            throw new Error(`Invalid state transition: ${txn.status} -> FUNDS_HELD`);
        }

        txn.status = EscrowStatus.FUNDS_HELD;
        txn.updatedAt = new Date();
        
        console.log(`[Escrow] Funds held for ${transactionId}. Notifying seller to ship.`);
        return txn;
    }

    async courierCourierPickup(transactionId: string): Promise<IEscrowTransaction> {
         const txn = escrowTransactions.get(transactionId);
        if (!txn) throw new Error('Transaction not found');
        
        if (txn.status !== EscrowStatus.FUNDS_HELD) {
            throw new Error(`Invalid state transition: ${txn.status} -> IN_TRANSIT`);
        }

        txn.status = EscrowStatus.IN_TRANSIT;
        txn.updatedAt = new Date();
        
        console.log(`[Escrow] Item in transit for ${transactionId}`);
        return txn;
    }

    async handleCourierDelivery(transactionId: string): Promise<IEscrowTransaction> {
        const txn = escrowTransactions.get(transactionId);
        if (!txn) throw new Error('Transaction not found');
        
        if (txn.status !== EscrowStatus.IN_TRANSIT) {
             throw new Error(`Invalid state transition: ${txn.status} -> INSPECTING`);
        }

        txn.status = EscrowStatus.INSPECTING;
        
        // Set 72-hour inspection timer
        const inspectionEnd = new Date();
        inspectionEnd.setHours(inspectionEnd.getHours() + 72);
        txn.inspectionEndsAt = inspectionEnd;
        txn.updatedAt = new Date();

        console.log(`[Escrow] Item delivered for ${transactionId}. Inspection ends at ${inspectionEnd.toISOString()}`);
        return txn;
    }

    async resolveEscrow(transactionId: string, action: 'ACCEPT' | 'REJECT'): Promise<IEscrowTransaction> {
        const txn = escrowTransactions.get(transactionId);
        if (!txn) throw new Error('Transaction not found');

        if (txn.status !== EscrowStatus.INSPECTING) {
             throw new Error(`Cannot resolve transaction in state: ${txn.status}`);
        }

        if (action === 'ACCEPT') {
            txn.status = EscrowStatus.RELEASED;
            // Trigger payout logic here
            console.log(`[Escrow] Buyer accepted. Releasing funds to seller ${txn.sellerId}`);
        } else if (action === 'REJECT') {
            // Check if inspection period has expired
            if (txn.inspectionEndsAt && new Date() > txn.inspectionEndsAt) {
                throw new Error('Inspection period execution. Automatically releasing funds.');
            }
            txn.status = EscrowStatus.DISPUTED;
            console.log(`[Escrow] Buyer rejected. Dispute started.`);
        }

        txn.updatedAt = new Date();
        return txn;
    }

    // Helper for demo/frontend to see state
    async getTransaction(id: string): Promise<IEscrowTransaction | undefined> {
        return escrowTransactions.get(id);
    }
}
