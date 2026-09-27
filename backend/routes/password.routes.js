const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js");
const {
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controller/password.controller.js");

router.post("/change", protect, changePassword);

router.post("/forgot", forgotPassword);

router.post("/reset/:token", resetPassword);

module.exports = router;
