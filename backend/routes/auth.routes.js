const express = require('express');
const router = express.Router();
const authController = require("../controller/auth.controller.js");
const { protect } = require('../middleware/auth.middleware.js');

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.post("/verify-email", authController.verifyEmail);

router.get(
    "/session",
    protect,
    authController.checkAuth
);

router.delete(
    "/logout",
    protect,
    authController.logoutUser
);

module.exports = router;