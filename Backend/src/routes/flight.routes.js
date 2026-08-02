import express from "express";

import {
  getFlights,
  getFlightById,
  getFeaturedFlights,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flight.controller.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import * as flightValidators from "../validators/flight.validator.js";

const router = express.Router();

// public routes
router.get( "/",flightValidators.searchFlights,validate,getFlights);

router.get("/featured", getFeaturedFlights);

router.get("/:id",getFlightById);

// admin routes
router.post("/",authenticate, authorize("admin"), flightValidators.createFlight, validate, createFlight);

router.put( "/:id", authenticate, authorize("admin"), flightValidators.updateFlight, validate, updateFlight);

router.delete("/:id",authenticate,authorize("admin"),deleteFlight);

export default router;