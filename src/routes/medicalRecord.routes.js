import { Router } from 'express';
import {
  createMedicalRecord,
  getMedicalRecordByAppointment,
  updateMedicalRecord,
} from '../controllers/medicalRecord.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.post('/', restrictTo('veterinarian'), uploadMultiple('attachments', 5), createMedicalRecord);
router.patch('/', restrictTo('veterinarian'), uploadMultiple('attachments', 5), updateMedicalRecord);
router.get('/', getMedicalRecordByAppointment); // owner or vet


export default router;