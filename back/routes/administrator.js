import {Router} from 'express';
import {runGeneralSql, getAllDailysByProfessorName} from '../controller/administrator.js';
const router = Router();

router.get('/generalSql', runGeneralSql);
router.get('/daily', getAllDailysByProfessorName);

export default router;