import express from "express";
import multer from 'multer';
import { createCollaborator, deleteCollaborator, getCollaborators,getCollaborator, putCollaborator,uploadCollaborator } from '../controllers/collaboratorController.js';
import validateJWT from "../middlewares/validateJWT.js";
const router = express.Router();
const upload = multer({ dest: 'uploads/' });


router.get('/collaborators',validateJWT, getCollaborators)
router.get('/collaborator/:id',validateJWT, getCollaborator)
router.post('/collaborator',validateJWT, createCollaborator)
router.put('/collaborator/:id',validateJWT, putCollaborator)
router.delete('/collaborator/:id', validateJWT, deleteCollaborator)
router.post('/collaborators/upload',validateJWT, upload.single('file'), uploadCollaborator );





export default router