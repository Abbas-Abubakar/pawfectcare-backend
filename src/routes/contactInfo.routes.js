import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    info: env.shelterInfo,
  });
});

export default router;