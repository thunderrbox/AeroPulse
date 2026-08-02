
import express from "express";
import {
    getDashboardStats,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getAllBookings,
  updateBookingStatus,
  getRevenueAnalytics,
}  from "../controllers/admin.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router= express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', toggleUserStatus);  //activate or deactivate user
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;