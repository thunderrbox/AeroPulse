
import mongoose from "mongoose";

import Booking from "../models/booking.model.js";
import Flight from "../models/flight.model.js";

import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.utils.js";



//this controller does two things->
//1-> decrease the available seats
//2-> create the booking for the passenger

//it happens in a transaction i.e either both of them succeed or none take place


//COMPLETE FLOW

// Passenger sends booking request
//         ↓
// Start MongoDB transaction
//         ↓
// Atomically check seats + deduct seats
//         ↓
// Create booking document
//         ↓
// Commit transaction
//         ↓
// Fetch populated booking details
//         ↓
// Return confirmation

const createBooking = async (req, res, next) => {

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const {
            flightId,
            seatClass,
            passengers,
            contactEmail,
            contactPhone,
            payment,
        } = req.body;

        const passengerCount = passengers.length;

        const flight = await Flight.findOneAndUpdate(
            {
                _id: flightId,
                status: { $in: ["scheduled", "delayed"] },
                [`seats.${seatClass}.available`]: {
                    $gte: passengerCount,
                },
            },
            {
                $inc: {   //it is used for changing the number safely in mongodb
                    [`seats.${seatClass}.available`]:  -passengerCount,
                },
            },
            {
                new: true,
                session,
                runValidators: true,
            }
        );

        if (!flight) {
            await session.abortTransaction();
            session.endSession();

            return next(
                new AppError(
                    "Flight is unavailable or does not have enough seats.",
                    409
                )
            );
        }

        const pricePerPassenger =
            flight.seats[seatClass].price;

        const totalPrice =
            pricePerPassenger * passengerCount;
       
            //adding seat class to every passenger field
        const passengersWithClass = passengers.map(
            (passenger) => ({
                ...passenger,
                seatClass,
            })
        );

        //the booking is created inside the same transaction
        const booking = await Booking.create(
            [
                {
                    user: req.user._id,
                    flight: flight._id,

                    passengers:
                        passengersWithClass,

                    seatClass,

                    pricePerPassenger,
                    totalPrice,

                    contactEmail,
                    contactPhone,

                    payment: {
                        method:
                            payment?.method ||
                            "card",

                        transactionId:
                            payment?.transactionId ||
                            `TXN-${Date.now()}`,

                        paidAt: new Date(),

                        last4:
                            payment?.last4 ||
                            null,
                    },

                    status: "confirmed",
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        const populatedBooking =
            await Booking.findById(
                booking[0]._id
            )
                .populate(
                    "flight",
                    "flightNumber airline origin destination departureTime arrivalTime duration status"
                )
                .populate(
                    "user",
                    "firstName lastName email"
                );

        sendSuccess(
            res,
            201,
            "Booking created successfully",
            {
                booking:
                    populatedBooking,
            }
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        next(error);
    }
};


const getMyBookings = async (
    req,
    res,
    next
) => {
    try {
        const {
            status,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {
            user: req.user._id,
            isDeleted: false,
        };

        if (status) {
            query.status = status;
        }

        const pageNum = Math.max(
            1,
            Number(page)
        );

        const limitNum = Math.min(
            50,
            Math.max(1, Number(limit))
        );

        const skip =
            (pageNum - 1) * limitNum;

        const [bookings, total] =
            await Promise.all([
                Booking.find(query)
                    .populate(
                        "flight",
                        "flightNumber airline origin destination departureTime arrivalTime status"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limitNum),

                Booking.countDocuments(
                    query
                ),
            ]);

        sendSuccess(
            res,
            200,
            "Bookings fetched successfully",
            {
                bookings,
            },
            {
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(
                        total / limitNum
                    ),
                },
            }
        );
    } catch (error) {
        next(error);
    }
};


const getBookingById = async (
    req,
    res,
    next
) => {
    try {
        const booking =
            await Booking.findById(
                req.params.id
            )
                .populate("flight")
                .populate(
                    "user",
                    "firstName lastName email"
                );

        if (!booking) {
            return next(
                new AppError(
                    "Booking not found",
                    404
                )
            );
        }

        const isOwner =
            booking.user._id.toString() ===
            req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

            //return the booking info only if he is the user or an admin
        if (!isOwner && !isAdmin) {
            return next(
                new AppError(
                    "Access denied",
                    403
                )
            );
        }

        sendSuccess(
            res,
            200,
            "Booking fetched successfully",
            {
                booking,
            }
        );
    } catch (error) {
        next(error);
    }
};



const cancelBooking = async (
    req,
    res,
    next
) => {
    const session =
        await mongoose.startSession();

    try {
        session.startTransaction();

        const booking =
            await Booking.findById(
                req.params.id
            ).session(session);

        if (!booking) {
            await session.abortTransaction();
            session.endSession();

            return next(
                new AppError(
                    "Booking not found",
                    404
                )
            );
        }

        const isOwner =
            booking.user.toString() ===
            req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            await session.abortTransaction();
            session.endSession();

            return next(
                new AppError(
                    "Access denied",
                    403
                )
            );
        }

        if (booking.status ==="cancelled") {
            await session.abortTransaction();
            session.endSession();

            return next(
                new AppError(
                    "Booking already cancelled",
                    409
                )
            );
        }

        const flight =
            await Flight.findById(
                booking.flight
            ).session(session);

        if (!flight) {
            await session.abortTransaction();
            session.endSession();

            return next(
                new AppError(
                    "Associated flight not found",
                    404
                )
            );
        }

        const hoursUntilDeparture =
            (flight.departureTime -
                new Date()) /
            (1000 * 60 * 60);

        if (
            hoursUntilDeparture < 2
        ) {
            await session.abortTransaction();
            session.endSession();

            return next(
                new AppError(
                    "Cancellation is not allowed within 2 hours of departure.",
                    400
                )
            );
        }

        await Flight.findByIdAndUpdate(
            booking.flight,
            { 
                $inc: {    //increement the seats that has been cancelled by the user
                    [`seats.${booking.seatClass}.available`]: booking.passengers.length,
                },
            },
            { session }
        );

        booking.status ="cancelled";

        booking.cancelledAt =new Date();

        booking.cancellationReason = req.body.reason || "User requested cancellation";

        await booking.save({
            session,
        });

        await session.commitTransaction();
        session.endSession();

        sendSuccess(
            res,
            200,
            "Booking cancelled successfully",
            {
                booking,
            }
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        next(error);
    }
};

export {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
};

