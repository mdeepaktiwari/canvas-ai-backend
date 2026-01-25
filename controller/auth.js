const User = require("../models/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  sendError,
  sendSuccess,
  asyncHandler,
} = require("../services/response");
const { HTTP_STATUS, JWT_EXPIRATION } = require("../constant");
const logger = require("../services/logger");
require("dotenv").config();

exports.signIn = asyncHandler(async (req, res) => {
  logger.info("Start processing of logging in request");

  const { email, password } = req.body;

  // input validation
  // add more checks for validation of email and password
  if (!email || !password) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Email and password are required",
    );
  }

  // find the user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, "User doesn't exists.");
  }

  // compare password with saved password (hashed)
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  // issue token
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: JWT_EXPIRATION,
  });

  return sendSuccess(res, HTTP_STATUS.OK, "Login successful", {
    token,
    name: user.name,
  });
});

exports.signUp = asyncHandler(async (req, res) => {
  logger.info("Start processing of signing up request");
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Name, email, password is required",
    );
  }

  // check if the user already exists in our database
  const user = await User.findOne({ email });
  if (user) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Email already exists");
  }

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // return user if required
  const updatedUser = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
  };

  return sendSuccess(res, HTTP_STATUS.CREATED, "User signed up successfully", {
    user: updatedUser,
  });
});
