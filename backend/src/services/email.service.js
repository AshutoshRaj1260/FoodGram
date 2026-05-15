const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOTPByEmail = async (email, otp) => {

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verify Your FoodGram Account</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background-color: #f4f4f5; font-family: 'Inter', sans-serif; }
        </style>
    </head>
    <body style="background-color:#f4f4f5; padding: 40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" role="presentation"
                        style="max-width:560px; width:100%; background:#ffffff; border-radius:20px;
                               overflow:hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10);">

                        <!-- Header Banner -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%);
                                        padding: 44px 40px 36px; text-align:center;">
                                <div style="font-size:44px; margin-bottom:12px;">🍔</div>
                                <h1 style="color:#ffffff; font-size:28px; font-weight:800;
                                           letter-spacing:-0.5px; margin:0;">FoodGram</h1>
                                <p style="color:rgba(255,255,255,0.85); font-size:14px;
                                          margin-top:6px; font-weight:500;">
                                    Your food discovery community
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 44px 40px 36px;">
                                <h2 style="color:#1a1a2e; font-size:22px; font-weight:700;
                                           margin-bottom:12px;">Verify your email address</h2>
                                <p style="color:#52525b; font-size:15px; line-height:1.65;
                                          margin-bottom:32px;">
                                    Thanks for signing up! Use the one-time code below to
                                    verify your account and start exploring amazing food around you.
                                </p>

                                <!-- OTP Box -->
                                <div style="background: linear-gradient(135deg, #fff7ed, #fff1e6);
                                            border: 2px solid #fed7aa; border-radius:16px;
                                            padding: 32px; text-align:center; margin-bottom:32px;">
                                    <p style="color:#9a3412; font-size:12px; font-weight:700;
                                               letter-spacing:2px; text-transform:uppercase;
                                               margin-bottom:16px;">Your Verification Code</p>
                                    <div style="display:inline-block;">
                                        <span style="font-size:52px; font-weight:800; letter-spacing:12px;
                                                     color:#ea580c; font-family:'Courier New', monospace;
                                                     background: linear-gradient(135deg, #ff6b35, #f7931e);
                                                     -webkit-background-clip: text;
                                                     -webkit-text-fill-color: transparent;
                                                     background-clip: text;">
                                            ${otp}
                                        </span>
                                    </div>
                                    <p style="color:#c2410c; font-size:13px; font-weight:500;
                                               margin-top:16px;">
                                        ⏱&nbsp; Expires in <strong>10 minutes</strong>
                                    </p>
                                </div>

                                <!-- Warning -->
                                <div style="background:#fef2f2; border-left:4px solid #f87171;
                                            border-radius:8px; padding:16px 20px; margin-bottom:32px;">
                                    <p style="color:#991b1b; font-size:13px; line-height:1.6; margin:0;">
                                        <strong>🔒 Security notice:</strong> Never share this code with anyone.
                                        FoodGram will never ask for your OTP via phone or chat.
                                    </p>
                                </div>

                                <p style="color:#71717a; font-size:14px; line-height:1.65;">
                                    If you didn't create a FoodGram account, you can safely ignore
                                    this email — no action is needed.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#fafafa; border-top:1px solid #f0f0f0;
                                        padding: 28px 40px; text-align:center;">
                                <p style="color:#a1a1aa; font-size:12px; line-height:1.7; margin:0;">
                                    © ${new Date().getFullYear()} FoodGram. All rights reserved.<br/>
                                    You're receiving this because you registered at FoodGram.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"FoodGram" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${otp} is your FoodGram verification code`,
        text: `Your FoodGram verification code is: ${otp}\n\nIt will expire in 10 minutes.\n\nIf you didn't sign up for FoodGram, please ignore this email.`,
        html: htmlTemplate,
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendOTPByEmail
}