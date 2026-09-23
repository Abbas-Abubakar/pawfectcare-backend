import { Router } from 'express';
import {
  createHealthRecord,
  getHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} from '../controllers/healthRecord.controller.js';
import { protect } from '../middleware/auth.middleware.js';

// mergeParams: true lets this router access :petId from the parent route
const router = Router({ mergeParams: true });

router.use(protect);

router.post('/', createHealthRecord);
router.get('/', getHealthRecords);
router.get('/:recordId', getHealthRecordById);
router.patch('/:recordId', updateHealthRecord);
router.delete('/:recordId', deleteHealthRecord);

export default router;