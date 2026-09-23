import { Router } from 'express';
import {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
  deletePet,
} from '../controllers/pet.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect); // every pet route requires authentication

router.post('/', restrictTo('pet_owner'), upload.single('photo'), createPet);
router.get('/', restrictTo('pet_owner'), getMyPets);
router.get('/:id', getPetById); // owners, vets, and shelter admins can all fetch by id
router.patch('/:id', restrictTo('pet_owner'), upload.single('photo'), updatePet);
router.delete('/:id', restrictTo('pet_owner'), deletePet);

export default router;