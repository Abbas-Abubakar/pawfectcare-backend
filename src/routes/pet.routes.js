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
import healthRecordRoutes from './healthRecord.routes.js';
import { getPetMedicalHistory } from '../controllers/medicalRecord.controller.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('pet_owner'), upload.single('photo'), createPet);
router.get('/', restrictTo('pet_owner'), getMyPets);
router.get('/:id', getPetById);
router.patch('/:id', restrictTo('pet_owner'), upload.single('photo'), updatePet);
router.delete('/:id', restrictTo('pet_owner'), deletePet);

router.use('/:petId/health-records', healthRecordRoutes);
router.get('/:petId/medical-records', getPetMedicalHistory);

export default router;