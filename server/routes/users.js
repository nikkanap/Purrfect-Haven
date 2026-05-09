import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getProfile, updateProfile, changePassword, getAllUsers, deleteUser,
} from '../controllers/usersController.js';

const router = express.Router();

router.get('/', requireAdmin, getAllUsers);  

router.delete('/:id', requireAdmin, deleteUser);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);

export default router;