import express from "express";
import { createUser, deleteUser, getUser, getUsers,login, logout, putUser, renewJWT  } from '../controllers/usersControllers.js';
import validateJWT from "../middlewares/validateJWT.js";

const router = express.Router();

router.get('/users', getUsers)
router.get('/user/:id', getUser)
router.post('/user', createUser)
router.put('/user/:id', putUser)
router.delete('/user/:id', deleteUser)
router.post('/login', login);
router.post('/logout', logout);
router.get('/renew', validateJWT,renewJWT);



export default router
