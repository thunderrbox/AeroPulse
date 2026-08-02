
import express from "express";

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/booking.controller.js";

import  authenticate  from "../middlewares/auth.middleware.js";

import validate  from "../middlewares/validate.middleware.js";

import {createBookingValidator} from "../validators/booking.validator.js";

const router = express.Router();

router.use(authenticate);

// create booking
router.post( "/", createBookingValidator, validate, createBooking);

// get logged in user bookings
router.get( "/my-bookings",getMyBookings);

// get single booking by id
router.get( "/:id", getBookingById);

// cancel booking by id
router.patch( "/:id/cancel", cancelBooking);

export default router;

