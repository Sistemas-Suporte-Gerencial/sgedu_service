import { Router } from 'express';
import { generateReport } from '../controller/generateReport.js';

const router = Router();

router.post('/generate', generateReport);

export default router;