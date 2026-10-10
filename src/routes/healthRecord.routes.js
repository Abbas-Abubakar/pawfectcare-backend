import { Router } from 'express';
import {
  createHealthRecord,
  getHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} from '../controllers/healthRecord.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { createHealthRecordValidator, recordIdParamValidator, updateHealthRecordValidator } from '../validators/healthRecord.validator.js';
import { validate } from '../middleware/validate.middleware.js';

// mergeParams: true lets this router access :petId from the parent route
const router = Router({ mergeParams: true });

router.use(protect);

router.post('/', createHealthRecordValidator, validate, createHealthRecord);
router.get('/', recordIdParamValidator, validate, getHealthRecords);
router.get('/:recordId', recordIdParamValidator, validate,  getHealthRecordById);
router.patch('/:recordId', updateHealthRecordValidator, validate, updateHealthRecord);
router.delete('/:recordId', recordIdParamValidator, validate, deleteHealthRecord);

export default router;