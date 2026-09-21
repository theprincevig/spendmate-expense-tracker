const User = require("../models/user.js");
const currencyConfig = require("../config/currency.Config.js");
const {
  generateTokenAndCookie,
  cookieOptions,
} = require("../utils/generateToken.js");
const { sendOtpEmail } = require("../services/email.service.js");
const {
  generateOtp,
  saveOtp,
  verifyOtp,
  checkOtpSendLimit,
  recordOtpSend,
} = require("../services/otp.service.js");

module.exports.checkAuth = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId).select("-password");
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Check Auth Error: ", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.registerUser = async (req, res) => {
  const { email, password, currency } = req.body;

  // Validation: check for missing fields
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  try {
    // Check if email already exists
    const existing = await User.findOne({ email });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }

    // Set default currency if not provided
    const selectedCurrency = currencyConfig[currency] ? currency : "INR";

    // Email verification
    const otp = generateOtp();
    await saveOtp(email, otp, "verify");
    await sendOtpEmail(email, otp);

    // Create the new user
    const user = await User.create({
      email,
      password,
      currency: selectedCurrency,
    });

    return res.status(201).json({
      success: true,
      message:
        "Signup successfully! Please verify your email to activate your account.",
      user,
    });
  } catch (error) {
    console.error("Signup Error: ", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: "Email and OTP are required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified.",
      });
    }

    const isValid = await verifyOtp(email, otp, "verify");

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP.",
      });
    }

    user.isVerified = true;
    await user.save();

    generateTokenAndCookie(user._id, res);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user,
    });
  } catch (error) {
    console.error("Email Verification Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.resendVerifyEmail = async (req, res) => {
  const { email } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: "Email is required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified.",
      });
    }

    // Check cooldown / max-send limit
    const limitCheck = await checkOtpSendLimit(email);

    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error:
          limitCheck.reason === "cooldown"
            ? `Please wait ${limitCheck.retryAfter}s before requesting another OTP.`
            : `
                Maximum OTP requests reached. Try again in 
                ${Math.ceil(limitCheck.retryAfter / 60)} 
                minute(s).
            `,
        retryAfter: limitCheck.retryAfter,
      });
    }

    const otp = generateOtp();
    await saveOtp(email, otp, "verify");
    await sendOtpEmail(email, otp);
    await recordOtpSend(email);

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend Email Verification Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in.",
      });
    }

    generateTokenAndCookie(user._id, res);

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      user,
    });
  } catch (error) {
    console.error("Login Error: ", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports.logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", cookieOptions);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    console.error("Logout Error: ", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
