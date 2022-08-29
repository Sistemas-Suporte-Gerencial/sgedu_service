import {Router} from 'express';
import { sendEmail } from '../controller/email.js';

const router = Router();

router.post('/send', sendEmail);

export default router;