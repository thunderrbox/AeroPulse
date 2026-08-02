import { body } from "express-validator";

export const createBookingValidator = [
  body("flightId")
    .notEmpty()
    .withMessage("Flight ID is required")
    .isMongoId()
    .withMessage("Invalid flight ID format"),

  body("seatClass")
    .notEmpty()
    .withMessage("Seat class is required")
    .isIn(["economy", "business"])
    .withMessage("Seat class must be economy or business"),

  body("passengers")
    .notEmpty()
    .withMessage("At least one passenger is required")
    .isArray({ min: 1, max: 9 })
    .withMessage("Passengers must be an array of 1-9 passengers"),

  body("passengers.*.firstName")
    .trim()
    .notEmpty()
    .withMessage("Passenger first name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  body("passengers.*.lastName")
    .trim()
    .notEmpty()
    .withMessage("Passenger last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),

  body("passengers.*.age")
    .notEmpty()
    .withMessage("Passenger age is required")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),

  body("passengers.*.seatClass")
    .notEmpty()
    .withMessage("Passenger seat class is required")
    .isIn(["economy", "business"])
    .withMessage(
      "Passenger seat class must be economy or business"
    ),

  body("passengers")
    .custom((passengers, { req }) => {
      const bookingSeatClass = req.body.seatClass;

      const allPassengersMatch = passengers.every(
        (passenger) =>
          passenger.seatClass === bookingSeatClass
      );

      if (!allPassengersMatch) {
        throw new Error(
          "All passengers must have the same seat class as the booking"
        );
      }

      return true;
    }),

  body("passengers.*.passportNumber")
    .optional()
    .trim()
    .toUpperCase()
    .isLength({ min: 5, max: 20 })
    .withMessage(
      "Passport number must be between 5 and 20 characters"
    ),

  body("passengers.*.nationality")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage(
      "Nationality cannot exceed 50 characters"
    ),

  body("contactEmail")
    .trim()
    .notEmpty()
    .withMessage("Contact email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("contactPhone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  body("payment.method")
    .optional()
    .isIn([
      "card",
      "upi",
      "netbanking",
      "wallet",
    ])
    .withMessage("Invalid payment method"),
];