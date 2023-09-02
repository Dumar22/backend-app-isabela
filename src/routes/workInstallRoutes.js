import express from "express";
import multer from 'multer';
import { createWorkInstall, deleteWorkInstall, getWorkInstall, getWorkInstallById, putWorkInstall, uploadWorkInstall } from '../controllers/workInstall.js';

import validateJWT from "../middlewares/validateJWT.js";


const router = express.Router();
const upload = multer({ dest: 'uploads/' });


router.get('/workinstall',validateJWT, getWorkInstall,)
router.get('/workinstall/:id',validateJWT, getWorkInstallById,)
router.post('/workinstall', validateJWT, createWorkInstall,)
router.post('/workinstall/upload', validateJWT,upload.single('file'), uploadWorkInstall,);
router.put('/workinstall/:id',validateJWT, putWorkInstall,)
router.delete('/workinstall/:id', validateJWT, deleteWorkInstall,)








export default router