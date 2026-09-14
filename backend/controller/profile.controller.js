// =======================
// Imports
// =======================
const User = require('../models/user');
const { cloudinary } = require("../config/cloud.Config.js");
const mongoose = require("mongoose");
const currencyConfig = require('../config/currency.Config.js');

// =======================
// Helpers
// =======================
const SAFE_FIELDS = "fullName email profilePic dob gender phone address currency";

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("res.cloudinary.com")) return;

  try {
    const publicId = imageUrl
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn("Cloudinary delete failed:", error.message);
  }
};

const applyProfileUpdates = async (user, profileData, req) => {
  const {
    fullName,
    email,
    dob,
    profilePic,
    gender,
    phone,
    country,
    currency
  } = profileData;

  if (fullName !== undefined) user.fullName = fullName;
  if (dob !== undefined) user.dob = dob;
  if (phone !== undefined) user.phone = phone;
  if (gender !== undefined) user.gender = gender;
  if (country !== undefined) user.country = country;

  if (email !== undefined && email !== user.email) {
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id }  // Exclude current user
    });

    if (existingUser) throw new Error("Email has been already taken");

    user.email = email.toLowerCase();
  }

  // ---- Currency update ----
  if (currency !== undefined) {
    if (currencyConfig[currency]) {
        user.currency = currency;   // set {code, symbol}
    }
  }

  // Reset to default avatar
  if (profilePic === "") {
    await deleteFromCloudinary(user.profilePic);
    user.profilePic = "";
  }

  // New image uploaded
  if (req.file) {
    await deleteFromCloudinary(user.profilePic);
    user.profilePic = req.file.path;
  }
};

module.exports.viewProfile = async (req, res) => {
  const userId = req.user._id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
            success: false,
            error: "Invalid user id",
            });
        }

        const user = await User.findById(userId).select(SAFE_FIELDS);
        
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({
          success: true,
          user
        });
        
    } catch (error) {
        console.error("View profile error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports.updateProfile = async (req, res) => {
  const userId = req.user._id;
  const profileData = JSON.parse(req.body.profileData);
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    await applyProfileUpdates(user, profileData, req);
    await user.save();

    const updatedUser = await User.findById(userId).select(SAFE_FIELDS);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser
    });

  } catch (error) {
    if (error.message === "Email already taken") {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({
        success: false,
        message: error.message
    });
  }
};

module.exports.changeCurrency = async (req, res) => {
    const { currency } = req.body;
    const userId = req.user._id;

    if (!currency) {
        return res.status(400).json({
            success: false,
            error: "Currency is required"
        });
    }

    try {
        // Check valid currency
        if (!currencyConfig[currency]) {
            return res.status(400).json({
                success: false,
                error: "Invalid currency"
            });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        user.currency = currency;
        await user.save();

        const updatedUser = await User.findById(userId).select(SAFE_FIELDS);

        return res.status(200).json({
            success: true,
            message: "Currency updated successfully!",
            user: updatedUser
        });
        
    } catch (error) {
        console.error("Change currency Error: ", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
