const Vendor = require("../models/vendorModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const {
  createTokenVendor,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllVendors = async (req, res) => {
  const vendors = await Vendor.find({ role: "vendor" }).select("-password");
  res.status(StatusCodes.OK).json({ vendors });
};

const getSingleVendor = async (req, res) => {
  const vendor = await Vendor.findOne({ _id: req.params.id }).select(
    "-password"
  );
  // console.log("vendor", vendor);
  if (!vendor) {
    throw new CustomError.NotFoundError(
      `no vendor with user id :${req.params.id}`
    );
  }

  checkPermissions(req.user, vendor._id);
  res.status(StatusCodes.OK).json({ vendor });
};

const showCurrentVendor = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateVendor = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Please fill in all fields");
  }

  const vendor = await Vendor.findOne({ _id: req.user.userId });

  vendor.email = email;
  vendor.name = name;
  vendor.address;

  await vendor.save();

  const tokenVendor = createTokenVendor(vendor);
  attachCookiesToResponse({ res, user: tokenVendor });
  res.status(StatusCodes.OK).json({ user: tokenVendor });
};

const updateVendorPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please provide both credentials");
  }

  const vendor = await Vendor.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await vendor.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }

  vendor.password = newPassword;

  await vendor.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated" });
};

const updateVendorVerifiedStatus = async (req, res) => {
  const { id: vendorId } = req.params;

  const vendor = await Vendor.findOne({ _id: vendorId });

  if (!vendor) {
    throw new CustomError.NotFoundError(`no vendor with Id: ${vendorId}`);
  }

  vendor.verified = !vendor.verified;

  await vendor.save();
  res.status(StatusCodes.OK).json({ user: vendor });
};

module.exports = {
  getAllVendors,
  getSingleVendor,
  showCurrentVendor,
  updateVendor,
  updateVendorPassword,
  updateVendorVerifiedStatus,
};
