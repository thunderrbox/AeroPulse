import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Passenger first name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Passenger last name is required"],
      trim: true,
    },

    age: {
      type: Number,
      required: [true, "Passenger age is required"],
      min: 1,
      max: 120,
    },

    passportNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    nationality: {
      type: String,
      trim: true,
      default: null,
    },

    seatClass: {
      type: String,
      enum: ["economy", "business"],
      required: true,
    },

    seatNumber: {
      type: String,
      trim: true,
      default: "05A",
    },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["card", "upi", "netbanking"],
      default: "card",
    },

    transactionId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    last4: {     //store the last four digits of the card used for payment
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },

    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: (arr) =>
          arr.length >= 1 && arr.length <= 9,
        message:
          "A booking must contain between 1 and 9 passengers",
      },
    },

    seatClass: {
      type: String,
      enum: ["economy", "business"],
      required: true,
    },

    pricePerPassenger: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "confirmed",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
    },

    payment: {
      type: paymentSchema,
      default: () => ({}),
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    contactPhone: {
      type: String,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {   //include virtual field in the api response
      virtuals: true,
    },
    toObject: {  //include virtual field when I create javascript object
      virtuals: true,
    },
  }
);


//creating a booking reference
bookingSchema.pre("validate", function (next) {
  if (!this.bookingRef) {
    this.bookingRef =
      "SKY" +
      Math.random()   //get a random number -> convert into base 36 -> remove 0. -> convert it into uppercase
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
  }


});

// indexes
bookingSchema.index({
  user: 1,
  createdAt: -1,
});

bookingSchema.index({
  flight: 1,
  status: 1,
});

bookingSchema.index({
  status: 1,
  createdAt: -1,
});

// virtual for passenger count
bookingSchema.virtual("passengerCount").get(function () {
  return this.passengers.length;
});

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;