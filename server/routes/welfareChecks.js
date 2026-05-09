import express from 'express';
import {
  getAllWelfareChecks,
  respondToWelfareCheck,
  getMyPendingChecks,
} from '../controllers/welfareChecksController.js';
import { requireAuth }  from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// max 5 photos per welfare check, ise-save sa /uploads/welfare-checks/
const upload = makeUploader('welfare-checks', 5);

// adopter responds to a welfare check — kasama na ang multer middleware.
// upload.array('photos', 5) means: tatanggap ng up to 5 files na nasa
// 'photos' field name sa form-data.
router.put(
  '/:check_id/respond',
  requireAuth,
  (req, res, next) => {
    upload.array('photos', 5)(req, res, (err) => {
      if (err) return handleUploadError(err, res);
      next();
    });
  },
  respondToWelfareCheck
);

// admin sees all welfare checks
router.get('/', requireAdmin, getAllWelfareChecks);

// adopter sees their own pending checks
router.get('/pending', requireAuth, getMyPendingChecks);

export default router;