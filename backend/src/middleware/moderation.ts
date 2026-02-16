import { Request, Response, NextFunction } from 'express';
import { TrustSafetyService } from '../services/TrustSafetyService';

const trustService = new TrustSafetyService();

/**
 * Moderation middleware that intercepts POST /api/listings
 * and runs content through OpenAI Moderation API (mocked).
 * If flagged, sets moderation_status to PENDING_MODERATION.
 */
export async function moderationMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      next();
      return;
    }

    const contentToCheck = `${title || ''} ${description || ''}`;
    const result = await trustService.moderateContent(contentToCheck);

    if (result.flagged) {
      req.body._moderationStatus = 'PENDING_MODERATION';
      req.body._moderationCategories = result.categories;
      console.log(`[Moderation] Content flagged: ${result.categories.join(', ')}`);
    } else {
      req.body._moderationStatus = 'ACTIVE';
    }

    next();
  } catch (error) {
    console.error('[Moderation] Error during moderation check:', error);
    // Don't block the request if moderation fails — default to manual review
    req.body._moderationStatus = 'PENDING_MODERATION';
    next();
  }
}
