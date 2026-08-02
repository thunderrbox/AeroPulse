import { body, query } from "express-validator";

const createFlight = [
    body("flightNumber")
        .trim()
        .notEmpty()
        .withMessage("Flight number is required")
        .toUpperCase()
        .matches(/^[A-Z0-9]{2,8}$/)
        .withMessage("Flight number must be 2-8 alphanumeric characters"),

    body("airline")
        .trim()
        .notEmpty()
        .withMessage("Airline name is required")
        .isLength({ max: 100 })
        .withMessage("Airline name too long"),

    body("origin.code")
        .trim()
        .toUpperCase()
        .notEmpty()
        .withMessage("Origin airport code is required")
        .isLength({ min: 3, max: 3 })
        .withMessage( "Origin airport code must be exactly 3 letters")
        .isAlpha()
        .withMessage(
            "Origin airport code must contain only letters"
        ),

    body("origin.city")
        .trim()
        .notEmpty()
        .withMessage("Origin city is required"),

    body("origin.airport")
        .trim()
        .notEmpty()
        .withMessage("Origin airport is required"),

    body("origin.country")
        .trim()
        .notEmpty()
        .withMessage("Origin country is required"),

    body("destination.code")
        .trim()
        .toUpperCase()
        .notEmpty()
        .withMessage("Destination airport code is required")
        .isLength({ min: 3, max: 3 })
        .withMessage("Destination airport code must be exactly 3 letters")
        .isAlpha()
        .withMessage("Destination airport code must contain only letters")
        .custom((value, { req }) => {
            if ( value === req.body?.origin?.code) {
                throw new Error("Origin and destination cannot be the same");
            }
            return true;
        }),

    body("destination.city")
        .trim()
        .notEmpty()
        .withMessage("Destination city is required"),

    body("destination.airport")
        .trim()
        .notEmpty()
        .withMessage("Destination airport is required"),

    body("destination.country")
        .trim()
        .notEmpty()
        .withMessage("Destination country is required"),

    body("flightDate")
        .notEmpty()
        .withMessage("Flight date is required")
        .isISO8601()
        .withMessage("Flight date must be a valid date"),

    body("departureTime")
        .notEmpty()
        .withMessage("Departure time is required")
        .isISO8601()
        .withMessage("Departure time must be a valid date")
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error(
                    "Departure time cannot be in the past"
                );
            }
            return true;
        }),

    body("arrivalTime")
        .notEmpty()
        .withMessage("Arrival time is required")
        .isISO8601()
        .withMessage("Arrival time must be a valid date")
        .custom((value, { req }) => {
            if ( new Date(value) <= new Date(req.body.departureTime)){
                throw new Error("Arrival time must be after departure time");
            }
            return true;
        }),

    body("seats.economy.total")
        .isInt({ min: 0 })
        .withMessage("Economy total seats must be a non-negative integer"),

    body("seats.economy.available")
        .isInt({ min: 0 })
        .withMessage("Economy available seats must be a non-negative integer"),

    body("seats.economy.price")
        .isFloat({ min: 0 })
        .withMessage("Economy price must be a non-negative number"),

    body("seats.business.total")
        .isInt({ min: 0 })
        .withMessage("Business total seats must be a non-negative integer"),

    body("seats.business.available")
        .isInt({ min: 0 })
        .withMessage("Business available seats must be a non-negative integer"),

    body("seats.business.price")
        .isFloat({ min: 0 })
        .withMessage(
            "Business price must be a non-negative number"
        ),

    body("stops")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
            "Stops must be a non-negative integer"
        ),

    body("amenities")
        .optional()
        .isArray()
        .withMessage(
            "Amenities must be an array"
        ),

    body("isFeatured")
        .optional()
        .isBoolean()
        .withMessage(
            "isFeatured must be true or false"
        ),

    body("status")
        .optional()
        .isIn([
            "scheduled",
            "delayed",
            "cancelled",
            "completed",
        ])
        .withMessage("Invalid flight status"),
];

const updateFlight = [
    body("departureTime")
        .optional()
        .isISO8601()
        .withMessage(
            "Departure time must be a valid date"
        ),

    body("arrivalTime")
        .optional()
        .isISO8601()
        .withMessage(
            "Arrival time must be a valid date"
        ),

    body("seats.economy.price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage(
            "Economy price must be a non-negative number"
        ),

    body("seats.business.price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage(
            "Business price must be a non-negative number"
        ),

    body("seats.economy.available")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
            "Economy available seats must be a non-negative integer"
        ),

    body("seats.business.available")
        .optional()
        .isInt({ min: 0 })
        .withMessage(
            "Business available seats must be a non-negative integer"
        ),

    body("isFeatured")
        .optional()
        .isBoolean()
        .withMessage(
            "isFeatured must be true or false"
        ),

    body("status")
        .optional()
        .isIn([
            "scheduled",
            "delayed",
            "cancelled",
            "completed",
        ])
        .withMessage("Invalid flight status"),
];

const searchFlights = [
    query("origin")
        .optional()
        .trim()
        .toUpperCase()
        .isLength({ min: 3, max: 3 })
        .withMessage(
            "Origin code must be exactly 3 letters"
        ),

    query("destination")
        .optional()
        .trim()
        .toUpperCase()
        .isLength({ min: 3, max: 3 })
        .withMessage(
            "Destination code must be exactly 3 letters"
        ),

    query("date")
        .optional()
        .isISO8601()
        .withMessage(
            "Date must be a valid date"
        ),

    query("seatClass")
        .optional()
        .isIn(["economy", "business"])
        .withMessage(
            "Seat class must be economy or business"
        ),

    query("passengers")
        .optional()
        .isInt({ min: 1, max: 9 })
        .withMessage("Passengers must be between 1 and 9"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage(
            "Page must be a positive integer"
        ),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage(
            "Limit must be between 1 and 50"
        ),
];

export {
    createFlight,
    updateFlight,
    searchFlights,
};
