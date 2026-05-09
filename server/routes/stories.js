import express from 'express';
import {
  getFeaturedStory,
  getAllStories,
  getMyStories,
  requestStory,
  submitStory,
  initiateOwnStory,
  adminCreateStory,
  reviewStory,
  unpublishStory,
} from '../controllers/storiesController.js';
import { requireAuth }  from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// max 8 photos per story, ise-save sa /uploads/stories/
const upload = makeUploader('stories', 8);

// helper — wrapper around upload.array para mas malinis sa routes
function uploadStoryPhotos(req, res, next) {
  upload.array('photos', 8)(req, res, (err) => {
    if (err) return handleUploadError(err, res);
    next();
  });
}

// public
router.get('/featured', getFeaturedStory);

// adopter
router.get('/me', requireAuth, getMyStories);
router.post('/initiate', requireAuth, uploadStoryPhotos, initiateOwnStory);
router.put('/:id/submit', requireAuth, uploadStoryPhotos, submitStory);

// admin
router.get('/', requireAdmin, getAllStories);
router.post('/request', requireAdmin, requestStory);
router.post('/admin-create', requireAdmin, uploadStoryPhotos, adminCreateStory);
router.put('/:id/review', requireAdmin, reviewStory);
router.put('/:id/unpublish', requireAdmin, unpublishStory);

export default router;