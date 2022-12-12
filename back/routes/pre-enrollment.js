import { Router } from 'express';
import multer from "multer";
import { storage, limits, fileFilter } from "../config/multer.js";

import { parameters, insertNewPreEnrollment, schools, classes, getPersonByCpf } from '../controller/pre-enrollment.js';

const upload = multer({storage, limits, fileFilter});

const router = Router();

router.get('/parameters/:course_id', parameters);
router.get('/schools', schools);
router.get('/classes/:school_id', classes);
router.get('/person/:cpf', getPersonByCpf);
router.post('/new-enrollment', upload.any(), insertNewPreEnrollment);

export default router;