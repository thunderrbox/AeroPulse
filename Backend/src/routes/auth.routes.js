
import express from "express";

import * as authController from '../controllers/auth.controller.js';
import validate from "../middlewares/validate.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import * as authValidators from "../validators/auth.validator.js"

const router= express.Router();


router.use(authLimiter); //only entertains 10 requests for a single IP per 15 minutes for authentication
router.post('/register', authValidators.registerValidator, validate, authController.register);
router.post('/login', authValidators.loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

export default router;