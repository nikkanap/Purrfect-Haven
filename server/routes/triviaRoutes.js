import express from 'express';
import { getTrivia } from '../controllers/triviaController.js';

const router = express.Router();

router.get('/:type', getTrivia);


export default router;