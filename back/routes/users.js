import {Router} from 'express';
import {queryUser, encryptUserPassword, decryptUserPassword} from '../controller/user.js';

const router = Router();

router.post('/users', queryUser);
router.post('/encrypt', encryptUserPassword);
router.post('/decrypt', decryptUserPassword);


export default router;