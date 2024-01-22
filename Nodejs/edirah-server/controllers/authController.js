const User = require("../models/userModel");
const Vendor = require("../models/vendorModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  createTokenVendor,
} = require("../utils");

const register = async (req, res) => {
  const { email, name, password, interest } = req.body;

  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError("Email already Exist");
  }

  // first registered user is as admin
  const isFirstAdmin = (await User.countDocuments({})) === 0;
  const role = isFirstAdmin ? "admin" : "user";

  const user = await User.create({
    name,
    email,
    password,
    role,
    interest,
  });

  const tokenUser = createTokenUser(user);

  // console.log("tokenUser", tokenUser);

  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const registerVendor = async (req, res) => {
  const { vendorname, email, name, password, address, phone } = req.body;

  const emailAlreadyExist = await Vendor.findOne({ email });
  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError("Vendor already Exist");
  }

  const vendor = await Vendor.create({
    vendorname,
    name,
    email,
    password,
    address,
    phone,
  });

  // return verified status

  const tokenVendor = createTokenVendor(vendor);

  // console.log("tokenVendor", tokenVendor);

  attachCookiesToResponse({ res, user: tokenVendor });

  res.status(StatusCodes.CREATED).json({ user: tokenVendor });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const loginVendor = async (req, res) => {
  const { email, password } = req.body;
  console.log(req);

  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }

  const vendor = await Vendor.findOne({ email });

  if (!vendor) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await vendor.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenVendor = createTokenVendor(vendor);
  attachCookiesToResponse({ res, user: tokenVendor });
  res.status(StatusCodes.CREATED).json({ user: tokenVendor });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  // msg added for development purposes
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = { register, login, logout, registerVendor, loginVendor };
