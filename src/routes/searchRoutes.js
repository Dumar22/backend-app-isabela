import express from 'express';
import { getDocumentosColeccion, searchAll } from "../controllers/searchControllers.js";
import validateJWT from "../middlewares/validateJWT.js";


const router = express.Router();



router.get('/all/:search', searchAll );

router.get('/colection/:table/:search', getDocumentosColeccion );



export default router;