import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import { createInvoice, deleteInvoice, getInvoices,getInvoice, putInvoice, dowloadPdf } from '../controllers/invoiceController.js';

const router = express.Router();



router.get('/invoices', validateJWT, getInvoices)
router.get('/invoice/:id', getInvoice)
router.post('/invoice', validateJWT, createInvoice)
router.put('/invoice/:id', validateJWT, putInvoice)
router.delete('/invoice/:id', deleteInvoice)
router.get('/dowload-invoice/:id', dowloadPdf)








export default router