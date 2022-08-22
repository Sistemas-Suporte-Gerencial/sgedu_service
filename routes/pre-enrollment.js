import {Router} from 'express';
import multer from "multer";
import {storage, limits, fileFilter} from "../config/multer.js";

import {tableParameters, insertNewPreEnrollment} from '../controller/pre-enrollment.js';

const upload = multer({storage, limits, fileFilter});

const router = Router();

router.get('/table-parameters', tableParameters);
router.put('/new-enrollment', upload.any(), insertNewPreEnrollment);

export default router;