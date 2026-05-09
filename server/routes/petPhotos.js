import express from 'express';
import {
  uploadPetPhotos,
  deletePetPhoto,
} from '../controllers/petPhotosController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// max 10 photos per pet, ise-save sa /uploads/pets/
const upload = makeUploader('pets', 10);

router.post(
  '/:pet_id/photos',
  requireAdmin,
  (req, res, next) => {
    upload.array('photos', 10)(req, res, (err) => {
      if (err) return handleUploadError(err, res);
      next();
    });
  },
  uploadPetPhotos
);

router.delete('/photos/:photo_id', requireAdmin, deletePetPhoto);

export default router;
