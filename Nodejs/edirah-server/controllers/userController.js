const User = require("../models/userModel");
const Product = require("../models/productModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");
const { findById } = require("../models/userModel");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  // console.log("user", user);
  if (!user) {
    throw new CustomError.NotFoundError(`no user with id :${req.params.id}`);
  }

  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email, address } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Please fill in all fields");
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  user.address = address;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ mg: "Success! Password updated" });
};

const getCartItems = async (req, res) => {};

const addToCart = async (req, res) => {
  const user = await User.findById({ _id: req.user.userId });

  if (!user) {
    throw new CustomError.BadRequestError("user does not exist");
  }

  const { productid, quantity } = req.params;

  const product = await Product.findById({ _id: productid });

  if (!product) {
    throw new CustomError.NotFoundError(`no product with id: ${productid} `);
  }

  // check inventory if product is in stock
  const cartItems = user.cart.items;

  if (cartItems.length > 0) {
    // checknif exist and update quantity
    const productAlreadyInCart = cartItems.filter(
      (prod) => prod.product._id.toString() === productid
    );

    if (productAlreadyInCart.length > 0) {
      const idx = cartItems.indexOf(productAlreadyInCart[0]);
      // console.log("idx", idx);

      if (quantity > 0) {
        cartItems[idx] = { product: productid, quantity: quantity };
      } else {
        cartItems.splice(idx, 1);
      }
    } else {
      // push new item
      cartItems.push({ product: productid, quantity: quantity });
    }
  } else {
    // push new item
    cartItems.push({ product: productid, quantity: quantity });
  }

  await user.populate({
    path: "cart.items",

    populate: {
      path: "product",
      model: "Product",
      select: "name description price size image color vendor",

      populate: {
        path: "vendor",
        select: "vendorname",
      },
    },
  });

  // calculate cart total
  const data = cartItems.reduce(
    (cartTotal, itemsInCart) => {
      cartTotal, itemsInCart;

      const { quantity } = itemsInCart;
      const { product } = itemsInCart;
      const { price } = product;
      const itemTotal = price * quantity;

      cartTotal.total += itemTotal;
      cartTotal.quantity += quantity;

      return cartTotal;
    },
    { total: 0, quantity: 0 }
  );

  user.cart.total = data.total;
  user.cart.cartQuantity = data.quantity;

  // calculate freeshipping
  // if (user.cart.total > 110000) {
  //   user.cart.shipping = 0;
  // } else user.cart.shipping;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const removeFromCart = async (req, res) => {};

const clearCart = async (req, res) => {
  const user = await User.findById({ _id: req.user.userId });

  if (!user) {
    throw new CustomError.NotFoundError(`no user found with id ${user._id}`);
  }

  user.cart.items = [];

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const addToWishList = async (req, res) => {};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  showCurrentUser,
  addToCart,
  removeFromCart,
  clearCart,
  getCartItems,
  addToWishList,
};

// USING FINDONEANDUPDATE updateUser
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     throw new CustomError.BadRequestError("Please fill in all fields");
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };

// Update user with user.save()
// this messes with the password, hence why you
// use this.isModified("passwprd") in User.pre in user model
