module.exports.emailLayout = (content, expiryText) => (`
    <!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Verify your SpendMate account</title>

<style>
    body {
        margin: 0;
        padding: 0;
        width: 100dvw;
        height: 100dvh;
        background-color: #f5f5f5;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
    }

    .email-wrapper { padding: 8px 4px; }

    .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 10px;
        padding: 20px;
    }

    .brand {
        color: #41ab5d;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 35px;
    }
    .brand span {
        font-size: 12px;
        font-weight: medium;
        font-family: monospace;
        text-transform: uppercase;
    }

    .title {
        font-size: 20px;
        margin: 0 0 20px;
    }

    .text {
        color: #464646;
        font-size: 15px;
        line-height: 1.6;
        margin: 0 0 20px;
    }

    .otp {
        text-align: center;
        font-size: 30px;
        font-weight: bold;
        letter-spacing: 8px;
        padding: 15px;
        margin: 25px;
        background-color: #f4f4f4;
        border-radius: 8px;
    }

    .warning {
        color: #777777;
        font-size: 13px;
        line-height: 1.5;
    }

    .footer {
        text-align: center;
        color: #999999;
        font-size: 12px;
        margin-top: 30px;
    }

    @media only screen and (max-width: 600px) {
        .title { font-size: 18px; }
        .otp { font-size: 25px; }
    }

    .btn {
        text-align: center;
        margin: 30px, 0;
    }
    .btn a {
        display: inline-block;
        padding: 14px 28px;
        background-color: #41ab5d;
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: bold;
    }
</style>

</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="brand">
                SpendMate <span>Expense Tracker</span>
            </div>

            ${content}

            <p class="text">
                ${expiryText}
            </p>

            <p class="warning">
                For your security, never share this verification code with anyone.
                If you did not request this code, you can safely ignore this email.
            </p>

            <div class="footer">
                &copy; 2026 Spendmate. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>

`);