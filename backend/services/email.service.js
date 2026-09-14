// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const nodemailer = require('nodemailer');
const {
    verifyEmailTemplate,
    resetPasswordTemplate,
    resetSuccessTemplate
} = require('../templates/email.template');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// console.log(transporter.options);

module.exports.sendOtpEmail = async (email, otp) => {
    const template = verifyEmailTemplate(otp);

    await transporter.sendMail({
        from: `"SpendMate | Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your SpendMate verification code",
        html: template,
        text: `Your SpendMate verification code is ${otp}. It expires in 2 minutes.`
    });
};

module.exports.sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl =
        `${process.env.CLIENT_URL || 
            "http://localhost:5173"
        }
        /reset-password?token=${resetToken}`;

    const template = resetPasswordTemplate(resetUrl);

    await transporter.sendMail({
        from: `"SpendMate | Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your SpendMate password",
        html: template,
        text: `Reset your SpendMate password using this link: ${resetUrl}`
    });
};

module.exports.sendSuccessEmail = async (email) => {
    const template = resetSuccessTemplate();

    await transporter.sendMail({
        from: `"SpendMate | Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Successfully reset your SpendMate password",
        html: template,
        text: `Your SpendMate account's password has been successfully reset.`
    });
};
