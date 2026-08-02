import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/auth.routes.js";
import { globalErrorHandler, notFound } from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import userRoutes from "./routes/user.routes.js"
import flightRoutes from "./routes/flight.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet()); //it attaches security realted headers when the api's response is sent to the client

app.use(express.json({ limit: "10kb" })); //to read the json payload
app.use(express.urlencoded({ extended: true, limit: "10kb" })); //it converts url encoded form data into json

app.use(cookieParser(process.env.COOKIE_SECRET));

//app.use(mongoSanitize());


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://sky-way-swart.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allows Postman, Render health checks, and server-to-server requests
      if (!origin || allowedOrigins.includes(origin)) {  //no origin request comes from postman  ,so those requests are also allowed
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy: origin ${origin} is not allowed`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


//api hit by the deployed url on render
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AeroRana Executive API by Abhijeet Singh Rana is running ✈️",
  });
});


//health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AeroRana Executive API by Abhijeet Singh Rana is operational",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,  //tells the time since when the process started
  });
});

app.use("/api", apiLimiter); //for applying rate limiting

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user" ,userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);


// 404 handler
app.use(notFound);

//globale error handler
app.use(globalErrorHandler);

export default app;