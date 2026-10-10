import { Router } from 'express';
import {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
  deletePet,
} from '../controllers/pet.controller.js';
import { getPetMedicalHistory } from '../controllers/medicalRecord.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createPetValidator,
  updatePetValidator,
  petIdParamValidator,
  petIdForNestedValidator,
} from '../validators/pet.validator.js';
import healthRecordRoutes from './healthRecord.routes.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('pet_owner'), upload.single('photo'), createPetValidator, validate, createPet);
router.get('/', restrictTo('pet_owner'), getMyPets);
router.get('/:id', petIdParamValidator, validate, getPetById);
router.get('/:petId/medical-records', petIdForNestedValidator, validate, getPetMedicalHistory);
router.patch('/:id', restrictTo('pet_owner'), upload.single('photo'), petIdParamValidator, updatePetValidator, validate, updatePet);
router.delete('/:id', restrictTo('pet_owner'), petIdParamValidator, validate, deletePet);

router.use('/:petId/health-records', healthRecordRoutes);

export default router;