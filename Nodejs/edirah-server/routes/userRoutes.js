const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
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
} = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin", "owner"), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);

router
  .route("/addToCart/:productid/:quantity")
  .post(authenticateUser, addToCart);
router.route("/addToWishList").post(authenticateUser, addToWishList);
router.route("/cart").get(authenticateUser, getCartItems);

router.route("/clearCart").delete(authenticateUser, clearCart);

router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
