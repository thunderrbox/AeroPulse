import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { generateAccessToken , generateAndSaveRefreshToken , refreshCookieOptions , revokeAllUserTokens, verifyRefreshToken, revokeRefreshToken, } from "../utils/jwt.utils.js";
import { sendSuccess } from "../utils/response.utils.js";

const register = async (req, res, next) => {

  try {

    //get the data from registration form 
    const { firstName, lastName, email, password, phone } = req.body;
     console.log("next type:", typeof next);

    //check if the user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    //storing the data in db
    const user = await User.create({ firstName, lastName, email, password, phone });

    // issue tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const rawRefreshToken = await generateAndSaveRefreshToken(user._id); //hashed refresh token in saved in the db

    // set refresh token as httpOnly cookie
    res.cookie('refreshToken', rawRefreshToken, refreshCookieOptions);

    sendSuccess(res, 201, 'Account created successfully', {
      user,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    next(error); //pass the error to the global error handler middleware 
  }
};



const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password'); //here we are requesting the password also for comparison

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    //admin can activate or deactivate the user accounts
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Contact support.', 403));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const rawRefreshToken = await generateAndSaveRefreshToken(user._id);

    res.cookie('refreshToken', rawRefreshToken, refreshCookieOptions);

    user.password = undefined; //before sending the response back to the user we mark the password as undefined ,so that the frontend does not receive the user password

    sendSuccess(res, 200, 'Logged in successfully', {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};



const refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken; //extract he token from cookies

    if (!rawToken) {
      return next(new AppError('No refresh token provided.', 401));
    }

    //verifying refresh token from the db
    const tokenDoc = await verifyRefreshToken(rawToken);

    if (!tokenDoc) {
      //clearing the stale cookie
      res.clearCookie('refreshToken', { path: '/' });
      return next(new AppError('Invalid or expired session. Please log in again.', 401));
    }

    const user = tokenDoc.user;

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 403));
    }

    // performing the token rotation , revoking old and generating  new
    await revokeRefreshToken(rawToken);

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRawRefreshToken = await generateAndSaveRefreshToken(user._id);

    res.cookie('refreshToken', newRawRefreshToken, refreshCookieOptions);

    sendSuccess(res, 200, 'Token refreshed successfully', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};


const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    if (rawToken) {
      await revokeRefreshToken(rawToken);
    }

    // clear the cookie regardless
    res.clearCookie('refreshToken', { path: '/' });

    sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};


const logoutAll = async (req, res, next) => {
  try {
    await revokeAllUserTokens(req.user._id);
    res.clearCookie('refreshToken', { path: '/' });

    sendSuccess(res, 200, 'Logged out from all devices successfully');
  } catch (error) {
    next(error);
  }
};

export { register, login, refresh, logout, logoutAll };
