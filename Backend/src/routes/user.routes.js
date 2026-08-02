import express from "express";
import * as userController from '../controllers/user.controller.js';
import authenticate from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { changePassword } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate);
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.put('/me/password', changePassword, validate, userController.changePassword);


export default router;

