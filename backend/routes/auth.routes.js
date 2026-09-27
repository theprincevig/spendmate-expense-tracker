const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.post("/email/verify", authController.verifyEmail);
router.post("/email/verify/resend", authController.resendVerifyEmail);

router.get("/session", protect, authController.checkAuth);

router.delete("/logout", protect, authController.logoutUser);

module.exports = router;
