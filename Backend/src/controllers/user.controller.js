

import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.utils.js';
import { revokeAllUserTokens } from '../utils/jwt.utils.js';
import bcrypt from 'bcryptjs';

const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by authenticate middleware
    sendSuccess(res, 200, 'Profile fetched successfully', { user: req.user });
  } catch (error) {
    next(error);
  }
};


const updateMe = async (req, res, next) => {
  try {
    // prevent users from elevating their own role
    const { firstName, lastName, phone, avatar } = req.body;

    if (req.body.password || req.body.role) {
      return next(
        new AppError(
          'This route is not for password or role updates. Use /me/password instead.',
          400
        )
      );
    }

const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, avatar },
      {
        new: true,           // return the updated document
        runValidators: true, // run schema validators on the update
      }
    ).select('-password');;

    sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};


const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError(
          "Current password and new password are required.",
          400
        )
      );
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

  //check whether the current password entered by the user is correct or not   
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
  

    if (!isPasswordCorrect) {
      return next(
        new AppError("Current password is incorrect.", 401)
      );
    }

    if (currentPassword === newPassword) {
      return next(
        new AppError(
          "New password must be different from current password.",
          400
        )
      );
    }

    //update the password in the db
    user.password = newPassword;

    // triggers pre-save middleware and hashes password
    await user.save();

    // logout user from all devices as the password has been changed
    await revokeAllUserTokens(user._id);

    res.clearCookie("refreshToken", {
      path: "/",
    });

    sendSuccess(
      res,
      200,
      "Password changed successfully. Please log in again."
    );
  } catch (error) {
    next(error);
  }
};


export { getMe, updateMe, changePassword };
