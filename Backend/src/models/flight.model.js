import mongoose from "mongoose";

const airportSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            maxlength: 3,
            match: [
                /^[A-Z]{3}$/,
                "Airport code must be exactly 3 uppercase letters",
            ],
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        airport: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false } //do not create an id for this as these are basically the sub properties of the properties present in flight schema
);

const cabinSchema = new mongoose.Schema(
    {
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        available: {
            type: Number,
            required: true,
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const flightSchema = new mongoose.Schema(
    {
        flightNumber: {
            type: String,
            required: [true, "Flight number is required"],
            unique: true,
            uppercase: true,
            trim: true,
            match: [
                /^[A-Z0-9]{2,8}$/,
                "Invalid flight number format",
            ],
        },


        airline: {
            type: String,
            required: [true, "Airline name is required"],
            trim: true,
        },

        airlineLogo: {
            type: String,
            default: null,
        },

        origin: {
            type: airportSchema,
            required: [true, "Origin airport is required"],
        },

        destination: {
            type: airportSchema,
            required: [true, "Destination airport is required"],
        },

        flightDate: {
            type: Date,
            required: [true, "Flight date is required"],
        },

        departureTime: {
            type: Date,
            required: [true, "Departure time is required"],
        },

        arrivalTime: {
            type: Date,
            required: [true, "Arrival time is required"],
        },

        duration: {
            type: Number,
            min: [1, "Duration must be positive"],
        },

        seats: {
            economy: {
                type: cabinSchema,
                required: true,
            },

            business: {
                type: cabinSchema,
                required: true,
            },
        },

        status: {
            type: String,
            enum: [
                "scheduled",
                "delayed",
                "cancelled",
                "completed",
            ],
            default: "scheduled",
        },

        amenities: {
            type: [String],
            enum: [
                "wifi",
                "meals",
                "usb",
                "entertainment",
                "power",
                "extra_legroom",
            ],
            default: [],
        },

        aircraft: {
            type: String,
            trim: true,
            default: null,
        },

        stops: {
            type: Number,
            default: 0,
            min: 0,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },


    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

// indexes
flightSchema.index({
    "origin.code": 1,
    "destination.code": 1,
    departureTime: 1,
});

flightSchema.index({
    status: 1,
});

flightSchema.index({
    departureTime: 1,
});


//text index for keyword search
flightSchema.index({
    airline: "text",
    "origin.city": "text",
    "destination.city": "text",
});

// Virtual Duration Format
flightSchema.virtual("durationFormatted").get(function () {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;

    return `${hours}h ${minutes}m`;
});


flightSchema.pre("save", function (next) {
    if (this.arrivalTime <= this.departureTime) {
        return next(
            new Error(
                "Arrival time must be after departure time"
            )
        );
    }

    if (
        this.origin.code ===this.destination.code) {
        return next(
            new Error(
                "Origin and destination cannot be the same airport"
            )
        );
    }

    this.duration = Math.round(
        (this.arrivalTime - this.departureTime) /
        (1000 * 60) //this converts miliseconds into minutes
    );

    next();
});

const Flight = mongoose.model(
    "Flight",
    flightSchema
);

export default Flight;
