import {Router} from 'express';
import {migrateSecDatabase, migrateUniDatabase} from '../controller/migrate.js';

const router = Router();

router.post('/sec', migrateSecDatabase);
router.post('/uni', migrateUniDatabase);

export default router;