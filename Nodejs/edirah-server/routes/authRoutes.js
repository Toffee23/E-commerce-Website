const express = require("express");
const router = express.Router();

const {
  login,
  logout,
  register,
  registerVendor,
  loginVendor,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/register-vendor", registerVendor);

router.post("/login", login);
router.post("/login-vendor", loginVendor);

router.get("/logout", logout);

module.exports = router;
