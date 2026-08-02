import AppError from "../utils/AppError.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    //in the auth middleware we attached the user with the request after verifying the jwt token.So if user is missing it means the user has not been authenticated
    if (!req.user) {
      return next(
        new AppError("Authentication required.", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized for this action.`,
          403 //forbidden
        )
      );
    }

    next();
  };
};

export default authorize;