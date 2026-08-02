import Flight from "../models/flight.model.js";
import Booking from "../models/booking.model.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.utils.js";



//can be accessed  by passengers
const getFlights = async (req, res, next) => {
    try {
        const {
            origin,
            destination,
            date,
            seatClass = "economy",
            passengers = 1,
            minPrice,
            maxPrice,
            airline,
            stops,
            sort = "departureTime",
            page = 1,
            limit = 10,
        } = req.query;

        //developing Query from the values recieved from the frontend
        const query = {
            isDeleted: false,
            status: { $in: ["scheduled", "delayed"] },
        };

        if (origin) {
            query["origin.code"] = origin.toUpperCase();
        }

        if (destination) {
            query["destination.code"] = destination.toUpperCase();
        }

        //creating the range on the basis of date
       // 2026-07-10 00:00:00.000 ->start
      //  2026-07-10 23:59:59.999 ->end

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            query.flightDate = {
                $gte: start,
                $lte: end,
            };
        }

        query[`seats.${seatClass}.available`] = {
            $gte: Number(passengers),  //since the value comes in string format from the url therefore we are parsing it
        };

        if (minPrice || maxPrice) {
            query[`seats.${seatClass}.price`] = {};

            if (minPrice) {
                query[`seats.${seatClass}.price`].$gte =
                    Number(minPrice);
            }

            if (maxPrice) {
                query[`seats.${seatClass}.price`].$lte =
                    Number(maxPrice);
            }
        }

        //case-insenstive match for airlines
        if (airline) {
            query.airline = {
                $regex: airline,
                $options: "i",
            };
        }

        if (stops !== undefined) {
            query.stops = Number(stops);
        }

        const sortOptions = {
            departureTime: { departureTime: 1 },   //earliest flight first
            price_asc: {                           //cheapest flight first
                [`seats.${seatClass}.price`]: 1,
            },
            price_desc: {                            //costliest flight first
                [`seats.${seatClass}.price`]: -1,
            },
            duration: { duration: 1 },               //shortest flight first
        };

        const sortQuery = sortOptions[sort] || { departureTime: 1, };

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const skip = (pageNum - 1) * limitNum;  //calculating how many documnets to skip for the next page

        const [flights, total] = await Promise.all([
            Flight.find(query)
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum),

            Flight.countDocuments(query),
        ]);

        sendSuccess(
            res,
            200,
            "Flights fetched successfully",
            { flights },
            {
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            }
        );
    } catch (error) {
        next(error);
    }
};


//can be accessed by passengers
const getFlightById = async (req, res, next) => {
    try {
        const flight = await Flight.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!flight) {
            return next( new AppError("Flight not found", 404));
        }

        sendSuccess(
            res,
            200,
            "Flight fetched successfully",
            { flight }
        );
    } catch (error) {
        next(error);
    }
};

//can be accessed by passengers
const getFeaturedFlights = async (
    req,
    res,
    next
) => {
    try {
        //first find out the scheduled flights
        let flights = await Flight.find({
            isDeleted: false,
            isFeatured: true,
            status: "scheduled",
        }).limit(8);

        //if there are no scheduled flights then fetch the delayed fields
        if (flights.length === 0) {
            flights = await Flight.find({
                isDeleted: false,
                status: { $in: ["scheduled", "delayed"] },
                departureTime: { $gte: new Date() },
            })
                .sort({ departureTime: 1 })
                .limit(8);
        }

        sendSuccess(
            res,
            200,
            "Featured flights fetched successfully",
            { flights }
        );
    } catch (error) {
        next(error);
    }
};


//can be accessed by admin
const createFlight = async (
    req,
    res,
    next
) => {
    try {

        const flight = await Flight.create(req.body);

        sendSuccess(
            res,
            201,
            "Flight created successfully",
            { flight }
        );
    } catch (error) {
        next(error);
    }
};


//can be accessed by admin
const updateFlight = async (
    req,
    res,
    next
) => {
    try {
        const flight =
            await Flight.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,  //this ensures that the updated document is returned from the mongodb
                    runValidators: true,  //this ensures the schema level validations are applied on the updated document
                }
            );

        if (!flight) {
            return next( new AppError("Flight not found", 404));
        }

        sendSuccess(
            res,
            200,
            "Flight updated successfully",
            { flight }
        );
    } catch (error) {
        next(error);
    }
};


//can be accessed by admin
const deleteFlight = async (
    req,
    res,
    next
) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return next(
                new AppError("Flight not found", 404)
            );
        }

        const activeBookings =
            await Booking.countDocuments({
                flight: flight._id,
                status: "confirmed",
            });

        if (activeBookings > 0) {
            return next(
                new AppError(
                    `Cannot delete flight with ${activeBookings} confirmed booking(s).`,
                    409
                )
            );
        }

        flight.isDeleted = true;
        flight.status = "cancelled";

        await flight.save();

        sendSuccess(
            res,
            200,
            "Flight deleted successfully"
        );
    } catch (error) {
        next(error);
    }
};

export {
    getFlights,
    getFlightById,
    getFeaturedFlights,
    createFlight,
    updateFlight,
    deleteFlight,
};
