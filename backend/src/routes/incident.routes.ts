import { Router } from 'express';
import { getIncidents, getWebsiteIncidents } from '../controllers/incident.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

// GET /api/incidents
router.get('/', getIncidents);

// GET /api/websites/:id/incidents  (montado em website.routes)
export { getWebsiteIncidents };
export default router;
