const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

// Create
const handleCreateUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(404, "Please provide all fields"));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(
      new ApiError(400, "Please another email choose this is already exist")
    );
  }

  user = await User.create({
    name,
    email,
    password,
    role,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "User create successfully", user));
});

// Update
const handleUpdateUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const { id } = req.params;

  let user = await User.findById(id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  const update = {
    name,
    email,
    role,
  };

  if (password) {
    update.password = await bcrypt.hash(password, 12);
  }

  user = await User.findByIdAndUpdate(id, update, { new: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "User update successfully", user));
});

// Delete
const handleDeleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  user.disabled = true;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "User disabled successfully", user));
});

// Get All User
const handleGetAllUser = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  let skip = (page - 1) * limit;

  const users = await User.find({ disabled: false, $nor: [{ role: "Admin" }] })
    .skip(skip)
    .limit(limit)
    .select("-password")
    .exec();

  if (!users || users.length === 0) {
    return next(new ApiError(404, "User not found"));
  }

  const records = await User.find({
    disabled: false,
    $nor: [{ role: "Admin" }],
  }).countDocuments();

  const pages = Math.ceil(records / limit);

  const pagination = {
    current: Number(page),
    limit: Number(limit),
    next: {
      page: Number(page) < pages ? Number(page) + 1 : null,
      limit: Number(limit),
    },
    pages: pages,
    records: records,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Users list retrieved", users, pagination));
});

// Login
const handleLoginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.disabled === true) {
    return next(new ApiError(404, "User not found"));
  }

  if (
    email !== user.email ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return next(new ApiError(400, "Email and password doesn't match"));
  }

  const data = {
    user: {
      id: user._id,
      role: user.role,
    },
  };

  const token = jwt.sign(data, JWT_SECRET);

  const option = {
    httpOnly: true,
    secure: NODE_ENV === "development" ? false : true,
  };
  return res
    .status(200)
    .cookie("token", token, option)
    .json(
      new ApiResponse(200, "Login successfully....", { token, role: user.role })
    );
});

module.exports = {
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleGetAllUser,
  handleLoginUser,
};
