const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllVendors,
  getSingleVendor,
  showCurrentVendor,
  updateVendor,
  updateVendorPassword,
  updateVendorVerifiedStatus,
} = require("../controllers/vendorController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin", "owner"), getAllVendors);

router.route("/showMe").get(authenticateUser, showCurrentVendor);
router.route("/updateVendor").patch(authenticateUser, updateVendor);
router
  .route("/updateVendorPassword")
  .patch(authenticateUser, updateVendorPassword);

router
  .route("/:id/verifyVendor")
  .patch(
    authenticateUser,
    authorizePermissions("admin", "owner"),
    updateVendorVerifiedStatus
  );

router.route("/:id").get(authenticateUser, getSingleVendor);

module.exports = router;
