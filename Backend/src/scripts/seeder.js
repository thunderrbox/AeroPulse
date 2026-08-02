/**
 * seeder.js — Populates the database with realistic demo data.
 * Run with: npm run seed
 *
 * Creates:
 *   - 1 admin user
 *   - 5 regular users
 *   - 20 flights across popular routes
 *   - 15 bookings with varied statuses
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import Flight from '../models/flight.model.js';
import Booking from '../models/booking.model.js';
import RefreshToken from '../models/refreshToken.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const existingUri = process.env.MONGODB_URI;
dotenv.config({
  path: path.join(__dirname, '../../.env'),
});
if (existingUri) {
  process.env.MONGODB_URI = existingUri;
}


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

const AIRLINES = [
  'IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoFirst',
  'Emirates', 'Singapore Airlines', 'British Airways',
];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateFlightNumber = (airline) => {
  const prefix = airline.substring(0, 2).toUpperCase().replace(/\s/g, 'X');
  return `${prefix}${randomBetween(100, 999)}`;
};

const generateFutureDate = (daysAhead, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const generateBookingRef = (usedRefs) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let ref;

  do {
    ref =
      'SKY-' +
      Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join('');
  } while (usedRefs.has(ref));

  usedRefs.add(ref);

  return ref;
};

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Flight.deleteMany({}),
      Booking.deleteMany({}),
      RefreshToken.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ──────────────────────────────────────────────────────────────────
    const hashedAdminPw = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
    const hashedUserPw = await bcrypt.hash('User@123456', 12);

    const usersData = [
      {
        firstName: 'Abhijeet',
        lastName: 'Rana (Admin)',
        email: process.env.ADMIN_EMAIL || 'admin@aerorana.com',
        password: hashedAdminPw,
        role: 'admin',
        phone: '+91 9876543210',
        isActive: true,
      },
      { firstName: 'Abhijeet', lastName: 'Singh Rana', email: 'abhijeet@aerorana.com', password: hashedUserPw, phone: '+91 9876543211' },
      { firstName: 'Arjun', lastName: 'Sharma', email: 'arjun@example.com', password: hashedUserPw, phone: '+91 9123456780' },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com', password: hashedUserPw, phone: '+91 9234567891' },
      { firstName: 'Rahul', lastName: 'Gupta', email: 'rahul@example.com', password: hashedUserPw, phone: '+91 9345678902' },
      { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@example.com', password: hashedUserPw, phone: '+91 9456789013' },
    ];

    // Insert directly to bypass the pre-save hook (passwords already hashed)
    const users = await User.insertMany(usersData);
    console.log(`✅ Created ${users.length} users`);
    console.log(`   Admin: ${process.env.ADMIN_EMAIL || 'admin@aerorana.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log(`   Users: *@example.com / User@123456\n`);

    // ── Flights ────────────────────────────────────────────────────────────────
    const flightPairs = [
      [0, 1], [1, 0], [0, 2], [2, 0], [0, 3], [3, 0],
      [0, 4], [4, 0], [1, 2], [2, 1], [0, 6], [0, 7],
      [0, 8], [0, 9], [1, 6], [2, 7], [3, 8], [4, 9],
      [0, 5], [5, 0],
    ];

    const flightsData = flightPairs.map(([originIdx, destIdx], i) => {
      const origin = AIRPORTS[originIdx];
      const destination = AIRPORTS[destIdx];
      const airline = randomFrom(AIRLINES);
      const daysAhead = randomBetween(1, 30);
      const departHour = randomFrom([6, 8, 10, 12, 14, 16, 18, 20]);
      const durationMinutes = randomBetween(90, 720);
      const departureTime = generateFutureDate(daysAhead, departHour);
      const arrivalTime = new Date(departureTime.getTime() + durationMinutes * 60000);
      const econPrice = randomBetween(3000, 15000);
      const bizPrice = econPrice * randomBetween(2, 4);
      const econSeats = randomBetween(100, 160);
      const bizSeats = randomBetween(20, 40);

      return {
        flightNumber: generateFlightNumber(airline) + i,
        airline,
        origin,
        destination,
        flightDate: departureTime,
        departureTime,
        arrivalTime,
        seats: {
          economy: { total: econSeats, available: randomBetween(10, econSeats), price: econPrice },
          business: { total: bizSeats, available: randomBetween(2, bizSeats), price: bizPrice },
        },
        status: randomFrom(['scheduled', 'scheduled', 'scheduled', 'delayed']),
        amenities: ['wifi', 'meals', 'usb'].slice(0, randomBetween(1, 3)),
        stops: randomFrom([0, 0, 0, 1]),
        isFeatured: i < 4,
      };
    });

    const flights = await Flight.insertMany(flightsData);
    console.log(`✅ Created ${flights.length} flights\n`);

    // ── Bookings ───────────────────────────────────────────────────────────────
    const regularUsers = users.filter((u) => u.role === 'user');
    const bookingsData = [];
    const usedRefs = new Set();

    for (let i = 0; i < 15; i++) {
      const user = randomFrom(regularUsers);
      const flight = randomFrom(flights);
      const seatClass = randomFrom(['economy', 'economy', 'business']);
      const passengerCount = randomBetween(1, 3);
      const pricePerPassenger = flight.seats[seatClass].price;
      const ref = generateBookingRef(usedRefs);

      bookingsData.push({
        bookingRef: ref,
        user: user._id,
        flight: flight._id,
        passengers: Array.from({ length: passengerCount }, (_, idx) => ({
          firstName: `Passenger${idx + 1}`,
          lastName: user.lastName,
          age: randomBetween(20, 60),
          passportNumber: `IND${randomBetween(1000000, 9999999)}`,
          nationality: 'Indian',
          seatClass,
        })),
        seatClass,
        totalPrice: pricePerPassenger * passengerCount,
        pricePerPassenger,
        status: randomFrom(['confirmed', 'confirmed', 'confirmed', 'cancelled']),
        contactEmail: user.email,
        contactPhone: user.phone,
        payment: {
          method: randomFrom(['card', 'upi', 'netbanking']),
          transactionId: `TXN-${Date.now()}-${i}`,
          paidAt: new Date(),
          last4: String(randomBetween(1000, 9999)),
        },
      });
    }

    const bookings = await Booking.insertMany(bookingsData);
    console.log(`Created ${bookings.length} bookings\n`);
    console.log('Seed complete! Database is ready.\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SEED SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Users: ${users.length}`);
    console.log(`Flights: ${flights.length}`);
    console.log(`Bookings: ${bookings.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

seed();
