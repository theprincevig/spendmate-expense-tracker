const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware.js');
const {
    changePassword,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword
} = require('../controller/password.controller.js');

router.post(
    "/change-password",
    protect,
    changePassword
);

router.post("/forgot", forgotPassword);
router.post("/forgot-otp/verify", verifyForgotPasswordOtp);

router.post("/reset/:token", resetPassword);

module.exports = router;