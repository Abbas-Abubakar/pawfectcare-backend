import { Router } from 'express';
import {
  createMedicalRecord,
  getMedicalRecordByAppointment,
  updateMedicalRecord,
} from '../controllers/medicalRecord.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  appointmentIdParamValidator,
  createMedicalRecordValidator,
  updateMedicalRecordValidator,
} from '../validators/medicalRecord.validator.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.post('/', restrictTo('veterinarian'), uploadMultiple('attachments', 5), createMedicalRecordValidator, validate, createMedicalRecord);
router.get('/', appointmentIdParamValidator, validate, getMedicalRecordByAppointment);
router.patch('/', restrictTo('veterinarian'), uploadMultiple('attachments', 5), updateMedicalRecordValidator, validate, updateMedicalRecord);

export default router;