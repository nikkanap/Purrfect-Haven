import express from 'express';
import {
  getPets, getPetById, getAdoptedPets, getSpecies,
  createPet, updatePet, deletePet,
} from '../controllers/petsController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { makeUploader, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// max 10 photos per pet, ise-save sa /uploads/pets/
const upload = makeUploader('pets', 10);

// IMPORTANT: specific routes muna bago yung /:id catch-all
router.get('/species', getSpecies);
router.get('/adopted', getAdoptedPets);

// public list + detail
router.get('/', getPets);
router.get('/:id', getPetById);

// admin — gumawa ng bagong pet (kasama na ang photos via multer)
router.post(
  '/',
  requireAdmin,
  (req, res, next) => {
    upload.array('photos', 10)(req, res, (err) => {
      if (err) return handleUploadError(err, res);
      next();
    });
  },
  createPet
);

// admin — i-update ang pet details
router.put('/:id', requireAdmin, updatePet);

// admin — i-delete ang pet
router.delete('/:id', requireAdmin, deletePet);

export default router;