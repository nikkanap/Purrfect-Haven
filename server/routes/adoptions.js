import express from 'express';
import {
  submitApplication,
  getApplicationById,
  getMyApplications,
  getAllAdoptions,
  updateAdoptionStatus,
} from '../controllers/adoptionsController.js';
import {
  createUpdate,
  listUpdates,
} from '../controllers/postAdoptionUpdatesController.js';
import {
  requestWelfareCheck,
  listWelfareChecks,
} from '../controllers/welfareChecksController.js';
import { requireAuth }  from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

router.post('/',   requireAuth,  submitApplication);

router.get('/me',  requireAuth,  getMyApplications);
router.get('/:adoption_id', requireAuth, getApplicationById);

router.get('/',           requireAdmin, getAllAdoptions);
router.put('/:id/status', requireAdmin, updateAdoptionStatus);

router.post('/:adoption_id/updates', requireAuth, createUpdate);
router.get('/:adoption_id/updates',  requireAuth, listUpdates);

router.post('/:adoption_id/welfare-checks', requireAdmin, requestWelfareCheck);
router.get('/:adoption_id/welfare-checks',  requireAuth,  listWelfareChecks);

export default router;