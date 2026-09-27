const { emailLayout } = require("./emailLayout");

module.exports.verifyEmailTemplate = (otp) => emailLayout(`
    <h1 class="title">
        Verify your SpendMate account
    </h1>

    <p class="text">
        Dear user,
        <br><br>
        Please use the following verification code to verify your SpendMate account.
    </p>

    <div class="otp">
        ${otp}
    </div>
`, "This code will expire in <strong>2</strong> minutes.");

module.exports.resetPasswordTemplate = (resetUrl) => emailLayout(`
    <h1 class="title">
        Reset your SpendMate password
    </h1>

    <p class="text">
        Dear user,
        <br><br>
        We received a request to reset your SpendMate password.
        Click the button below to create a new password.
    </p>

    <div class="btn">
        <a href="${resetUrl}">
            Reset Password
        </a>
    </div>
`, "This password reset link will expire in <strong>4</strong> minutes.");

module.exports.resetSuccessTemplate = () => emailLayout(`
    <h1 class="title">
        Password reset successful
    </h1>

    <p class="text">
        Dear user,
        <br><br>
        Your password has been successfully reset.
        You can now log in to your SpendMate account with your new password.
    </p>
`, "This is a confirmation message. No action is required.");