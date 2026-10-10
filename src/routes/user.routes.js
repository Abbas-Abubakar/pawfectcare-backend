import { Router } from 'express';
import { updateProfile, changePassword, deactivateAccount, getVeterinarians } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileValidator, changePasswordValidator } from '../validators/user.validator.js';

const router = Router();

router.get('/vets', getVeterinarians);

router.use(protect);

router.patch('/me', upload.single('profilePhoto'), updateProfileValidator, validate, updateProfile);
router.patch('/me/password', changePasswordValidator, validate, changePassword);
router.delete('/me', deactivateAccount);

export default router;