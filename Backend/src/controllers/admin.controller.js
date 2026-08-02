
import User from '../models/user.model.js';
import Flight from '../models/flight.model.js';
import Booking from '../models/booking.model.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.utils.js';


const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);  //1 June 2026, 12:00:00 AM

    const [
      totalUsers,
      totalFlights,
      bookingStats,
      revenueThisMonth,
      recentBookings,
      flightStatusBreakdown,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),

      Flight.countDocuments({isDeleted: false}),

      //group all the bookings having same status
      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$totalPrice' },
          },
        },
      ]),

      Booking.aggregate([
        { //keep only those bookings which are made after the frst day of the selected month and whose status is confirmed
          $match: {
            createdAt: { $gte: startOfMonth },
            status: 'confirmed',
          },
        },
        {
          $group: {
            _id: null,  //put every matching booking in single group
            total: { $sum: '$totalPrice' },
            count: { $sum: 1 },
          },
        },
      ]),

      Booking.find()
        .populate('user', 'firstName lastName email')
        .populate('flight', 'flightNumber origin destination departureTime')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),  //it returns plain JSON instead of mongoose document


        //grouping flights by status
      Flight.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // flatten booking stats into a readable object so that the frontend can consume and render them easily
    const bookingsByStatus = bookingStats.reduce((acc, item) => {
      acc[item._id] = { count: item.count, revenue: item.revenue };
      return acc;
    }, {});

    const totalRevenue = bookingStats.reduce((sum, item) => {
      return item._id === 'confirmed' ? sum + item.revenue : sum;
    }, 0);

//counting flights by status -> [scheduled ,pending  ,cancelled , confirmed]

//  MongoDB gives grouped data as an array:

// bookingStats = [
//   { _id: 'confirmed', count: 20, revenue: 150000 },
//   { _id: 'cancelled', count: 3, revenue: 20000 },
// ];

// But the frontend would prefer:

// {
//   confirmed: { count: 20, revenue: 150000 },
//   cancelled: { count: 3, revenue: 20000 },
// }

//this is done by the reducer
    const flightsByStatus = flightStatusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    sendSuccess(res, 200, 'Dashboard stats fetched', {
      stats: {
        totalUsers,
        totalFlights,
        totalRevenue,
        totalBookings: bookingStats.reduce((sum, b) => sum + b.count, 0),
        confirmedBookings: bookingsByStatus.confirmed?.count || 0,
        cancelledBookings: bookingsByStatus.cancelled?.count || 0,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        bookingsThisMonth: revenueThisMonth[0]?.count || 0,
        flightsByStatus,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};



const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const query = {};  //we will construct our query now

    if (search) {   //case insenstive search
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  //but a backslash before every special character found  , this is done to ensusre a.b becomes a\.b so that the mongodb searches for literal text a.b and does not take . to match with any character
      query.$or = [
        { firstName: { $regex: escapedSearch, $options: 'i' } },
        { lastName: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';  

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Users fetched successfully', { users }, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};



const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    // get booking summary for this user
    const bookingSummary = await Booking.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);

    sendSuccess(res, 200, 'User fetched successfully', { user, bookingSummary });
  } catch (error) {
    next(error);
  }
};



const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    // prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot deactivate your own account.', 400));
    }

    user.isActive = !user.isActive; //toggle the user status
    await user.save();

    sendSuccess(
      res,
      200,
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      { user }
    );
  } catch (error) {
    next(error);
  }
};


const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum; //the number of documents to be skipped for the next page

    // text search on booking ref
    if (search) {
      query.bookingRef = { $regex: search.toUpperCase(), $options: 'i' };
    }

    const [bookings, total] = await Promise.all([

      Booking.find(query)
        .populate('user', 'firstName lastName email')
        .populate('flight', 'flightNumber airline origin destination departureTime status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Booking.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Bookings fetched successfully', { bookings }, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};


const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'pending', 'completed'].includes(status)) {
      return next(new AppError('Invalid booking status', 400));
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'cancelled' ? { cancelledAt: new Date() } : {}) },  //if the status is confimed then we will only keep status, if the status is cancelled we will add the cancelledAt field also in the document
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('flight', 'flightNumber airline origin destination');

    if (!booking) return next(new AppError('Booking not found', 404));

    sendSuccess(res, 200, 'Booking status updated successfully', { booking });
  } catch (error) {
    next(error);
  }
};


const getRevenueAnalytics = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // top routes by booking count
    const topRoutes = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $lookup: {
          from: 'flights',
          localField: 'flight',
          foreignField: '_id',
          as: 'flightData',
        },
      },
      { $unwind: '$flightData' },
      {
        $group: {
          _id: {
            origin: '$flightData.origin.code',
            destination: '$flightData.destination.code',
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    sendSuccess(res, 200, 'Revenue analytics fetched', {
      monthlyRevenue,
      topRoutes,
    });
  } catch (error) {
    next(error);
  }
};

export{
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getAllBookings,
  updateBookingStatus,
  getRevenueAnalytics,
};
