import express from 'express';
import {
  createCommunityPost,
  getCommunityPosts,
  getCommunityPostById,
  getMyCommunityPosts,
  updateCommunityPostStatus,
} from '../controllers/communityController.js';
import { requireAuth }  from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

router.post('/', requireAuth, createCommunityPost);

// /me must be registered before /:id so Express doesn't treat "me" as an id
router.get('/me', requireAuth, getMyCommunityPosts);

router.get('/', getCommunityPosts);
router.get('/:id', getCommunityPostById);

router.put('/:id/status', requireAdmin, updateCommunityPostStatus);

export default router;