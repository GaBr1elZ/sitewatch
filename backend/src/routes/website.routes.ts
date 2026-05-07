import { Router } from 'express';
import {
  getWebsites,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  getWebsiteStats,
  getWebsiteDetail,
} from '../controllers/website.controller';
import { getWebsiteIncidents } from '../controllers/incident.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/',          getWebsites);
router.post('/',         createWebsite);
router.patch('/:id',     updateWebsite);
router.delete('/:id',    deleteWebsite);
router.get('/:id/stats',     getWebsiteStats);
router.get('/:id/detail',    getWebsiteDetail);
router.get('/:id/incidents', getWebsiteIncidents);

export default router;
