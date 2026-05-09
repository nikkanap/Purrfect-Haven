import express from 'express';
import {
  submitRescueReport,
  getRescueReports,
  getRescueReportById,
  updateRescueReportStatus,
} from '../controllers/rescueController.js';
import { requireAuth }  from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

router.post('/', requireAuth, submitRescueReport);

// /me must be before /:id
router.get('/me', requireAuth, (req, res) => {
  req.query.mine = 'true';
  getRescueReports(req, res);
});

router.get('/', getRescueReports);
router.get('/:id', getRescueReportById);

router.put('/:id/status', requireAdmin, updateRescueReportStatus);

export default router;
