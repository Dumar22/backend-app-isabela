import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import { createEntry, deleteEntry, getEntryById,getEntry, getAllEntry, putEntry } from '../controllers/entryController.js';

const router = express.Router();



router.get('/entry', validateJWT, getEntry)
router.get('/entries',  getAllEntry)
router.get('/entry/:id',validateJWT, getEntryById)
router.post('/entry', validateJWT, createEntry)
router.put('/entry/:id', validateJWT, putEntry)
router.delete('/entry/:id', deleteEntry)









export default router