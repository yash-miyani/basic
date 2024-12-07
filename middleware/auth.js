const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

const fetchUser = catchAsync(async (req, res, next) => {
  const token = req.header("token") || req.cookies.token;
  if (!token) {
    return next(new ApiError(401, "Please authenticate using valid token"));
  }

  const data = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(data.user.id);
  if (!user) {
    res.clearCookie("token");
    return next(new ApiError(401, "Invalid token"));
  }

  if (user.disabled == true) {
    res.clearCookie("jwt-token");
    return next(
      new ApiError(
        401,
        "Your account has been deleted. Please log in new user."
      )
    );
  }

  req.user = data.user;
  next();
});

function restrictTo(roles) {
  return function (req, res, next) {
    try {
      if (!req.user || !req.user.role) {
        return next(new ApiError(401, "Invalid token"));
      }

      // User, Admin
      if (!roles.includes(req.user.role)) {
        return next(new ApiError(403, `Only access By ${roles}`));
      }
      return next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { fetchUser, restrictTo };
