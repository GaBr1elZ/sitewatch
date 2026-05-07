import { Router } from 'express';
import { getStatusPage } from '../controllers/status.controller';

const router = Router();

// GET /api/status/:slug  (público)
router.get('/:slug', getStatusPage);

export default router;
