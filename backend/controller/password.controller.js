const User = require('../models/user.js');
const {
    sendOtpEmail,
    sendPasswordResetEmail,
    sendSuccessEmail
} = require('../services/email.service.js');
const {
    generateOtp,
    saveOtp,
    verifyOtp,
    createResetToken,
    verifyResetToken,
    deleteResetToken
} = require('../services/otp.service.js');

module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        // Validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Old password and new password are required."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: "New password must be at least 8 characters."
            });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: "User not found." });

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) return res.status(400).json({ success: false, error: "Old password is incorrect." });

        // Update password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully! Please login again."
        });

    } catch (error) {
        console.error("Change Password Error: ", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: "Email field is required."
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }

        const otp = generateOtp();
        await saveOtp(email, otp, "reset");
        await sendOtpEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!"
        });
    } catch (error) {
        console.error("Forgot Password Error: ", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports.verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            error: "Email and OTP are required."
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }

        const isValid = await verifyOtp(email, otp, "reset");

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired OTP."
            });
        }

        const resetToken = await createResetToken(email);
        await sendPasswordResetEmail(email, resetToken);

        return res.status(200).json({
            success: true,
            message: "OTP verified! Password reset link has been sent to your email."
        });
    } catch (error) {
        console.error("Verify Forgot Password OTP Error: ", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports.resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            error: "Reset token and new password are required."
        });
    }

    try {
        const email = await verifyResetToken(token);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.password = newPassword;
        await user.save();

        await deleteResetToken(token);
        await sendSuccessEmail(email);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully!"
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
