import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  console.log('[ip-check] req.ip =', req.ip, '| x-forwarded-for =', req.headers['x-forwarded-for']);
  res.status(200).json({
    success: true,
    message: 'PawfectCare API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;