import Flight from "../models/flight.model.js";
import Booking from "../models/booking.model.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.utils.js";



const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', airport: 'Indira Gandhi International', country: 'India' },
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj International', country: 'India' },
  { code: 'BLR', city: 'Bengaluru', airport: 'Kempegowda International', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', airport: 'Rajiv Gandhi International', country: 'India' },
  { code: 'MAA', city: 'Chennai', airport: 'Chennai International', country: 'India' },
  { code: 'CCU', city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose International', country: 'India' },
  { code: 'DXB', city: 'Dubai', airport: 'Dubai International', country: 'UAE' },
  { code: 'SIN', city: 'Singapore', airport: 'Changi Airport', country: 'Singapore' },
  { code: 'LHR', city: 'London', airport: 'Heathrow Airport', country: 'UK' },
  { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International', country: 'USA' },
];
const AIRLINES = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Emirates', 'Singapore Airlines', 'British Airways'];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ensureFlightsExist = async () => {
  try {
    const count = await Flight.countDocuments({ isDeleted: false });
    if (count === 0) {
      const flightsData = [];
      const dateOffsets = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30];

      for (let i = 0; i < 35; i++) {
        const origin = randomFrom(AIRPORTS);
        let destination = randomFrom(AIRPORTS);
        while (destination.code === origin.code) {
          destination = randomFrom(AIRPORTS);
        }
        const airline = randomFrom(AIRLINES);
        const daysAhead = randomFrom(dateOffsets);
        const departure = new Date();
        departure.setDate(departure.getDate() + daysAhead);
        departure.setHours(randomBetween(6, 22), randomFrom([0, 15, 30, 45]), 0, 0);

        const durationMins = randomBetween(90, 480);
        const arrival = new Date(departure.getTime() + durationMins * 60000);
        const flightDate = new Date(departure);
        flightDate.setHours(0, 0, 0, 0);

        flightsData.push({
          flightNumber: `${airline.substring(0, 2).toUpperCase()}${randomBetween(100, 999)}`,
          airline,
          aircraft: randomFrom(['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A350']),
          origin,
          destination,
          departureTime: departure,
          arrivalTime: arrival,
          flightDate,
          duration: durationMins,
          status: 'scheduled',
          gate: `${randomFrom(['A', 'B', 'C'])}${randomBetween(1, 20)}`,
          terminal: `T${randomBetween(1, 3)}`,
          seats: {
            economy: { total: 150, available: randomBetween(20, 140), price: randomBetween(3500, 12000) },
            business: { total: 30, available: randomBetween(5, 25), price: randomBetween(15000, 45000) }
          },
          stops: randomFrom([0, 0, 0, 1]),
          amenities: ['wifi', 'meals', 'usb'],
          isFeatured: i % 4 === 0
        });
      }
      await Flight.insertMany(flightsData);
      console.log('Successfully seeded 35 flights');
    }
  } catch (err) {
    console.error('ensureFlightsExist Error:', err.message);
  }
};

//can be accessed by passengers
const getFlights = async (req, res, next) => {
    try {
        await ensureFlightsExist();

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
            query.$or = [
                { "origin.code": origin.toUpperCase() },
                { "origin.city": new RegExp(origin, 'i') }
            ];
        }

        if (destination) {
            query["destination.code"] = destination.toUpperCase();
        }

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
            $gte: Number(passengers),
        };

        if (minPrice || maxPrice) {
            query[`seats.${seatClass}.price`] = {};
            if (minPrice) query[`seats.${seatClass}.price`].$gte = Number(minPrice);
            if (maxPrice) query[`seats.${seatClass}.price`].$lte = Number(maxPrice);
        }

        if (airline) {
            query.airline = { $regex: airline, $options: "i" };
        }

        if (stops !== undefined) {
            query.stops = Number(stops);
        }

        const sortOptions = {
            departureTime: { departureTime: 1 },
            price_asc: { [`seats.${seatClass}.price`]: 1 },
            price_desc: { [`seats.${seatClass}.price`]: -1 },
            duration: { duration: 1 },
        };

        const sortQuery = sortOptions[sort] || { departureTime: 1 };
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        let [flights, total] = await Promise.all([
            Flight.find(query).sort(sortQuery).skip(skip).limit(limitNum),
            Flight.countDocuments(query),
        ]);

        // Fallback: If date filter produced 0 flights, return upcoming flights so user always sees available flights!
        if (flights.length === 0 && date) {
            delete query.flightDate;
            [flights, total] = await Promise.all([
                Flight.find(query).sort(sortQuery).skip(skip).limit(limitNum),
                Flight.countDocuments(query),
            ]);
        }

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
