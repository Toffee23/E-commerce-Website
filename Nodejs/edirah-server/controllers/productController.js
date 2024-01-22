const Product = require("../models/productModel");
const Vendor = require("../models/vendorModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  // set the lgged in vendor to the user object in the model
  req.body.vendor = req.user.userId;
  const product = await Product.create(req.body);

  await product.populate({
    path: "vendor",
    select: "vendorname",
  });

  res.status(StatusCodes.CREATED).json({ product });
};

const getAllVerifiedProducts = async (req, res) => {
  const product = await Product.find({ verified: true });
  res.status(StatusCodes.OK).json({ product, count: product.length });
};

const getAllProducts = async (req, res) => {
  const product = await Product.find({}).populate({
    path: "vendor",
    select: "name vendorname email phone address",
  });

  res.status(StatusCodes.OK).json({ product, count: product.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId })
    .populate("reviews")
    .populate({
      path: "vendor",
      select: "vendorname",
    });

  if (!product) {
    throw new CustomError.NotFoundError(`no product with id:${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError(`no product with id:${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateVerifiedStatus = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  product.verified = !product.verified;

  if (!product) {
    throw new CustomError.NotFoundError(`no product with id:${productId}`);
  }

  await product.save();

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`no product with id:${productId}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product deleted from DB" });
};

const uploadImage = async (req, res) => {
  console.log(req.files);
  if (!req.files) {
    throw new CustomError.BadRequestError("no files uploaded");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("please upload image");
  }

  const maxSize = 1024 * 1024;

  if (productImage > maxSize) {
    throw new CustomError.BadRequestError("file too large (max - 1MB");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );

  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllVerifiedProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  updateVerifiedStatus,
};
