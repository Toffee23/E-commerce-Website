const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllVerifiedProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  updateVerifiedStatus,
} = require("../controllers/productController");

const { getSingleProductReview } = require("../controllers/reviewController");
router
  .route("/")
  .post(
    authenticateUser,
    authorizePermissions("admin", "vendor"),
    createProduct
  )
  .get(
    authenticateUser,
    // authorizePermissions("users", "vendor", "admin"),
    getAllVerifiedProducts
  );

router
  .route("/allproducts")
  .get(authenticateUser, authorizePermissions("admin"), getAllProducts);

router
  .route("/uploadImage")
  .post(authenticateUser, authorizePermissions("admin"), uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(
    authenticateUser,
    authorizePermissions("admin"),
    updateProduct,
    updateVerifiedStatus
  )
  .delete(authenticateUser, authorizePermissions("admin"), deleteProduct);

router
  .route("/:id/verifyproduct")
  .patch(authenticateUser, authorizePermissions("admin"), updateVerifiedStatus);

router.route("/:id/reviews").get(getSingleProductReview);
module.exports = router;
