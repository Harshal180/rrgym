const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify connection once when server starts
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email server error:", error.message);
    } else {
        console.log("✅ Email server is ready");
    }
});

const sendEmail = async (to, subject, text, html = null) => {
    try {
        await transporter.sendMail({
            from: `Gym Management <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("📧 Email sent successfully to:", to);
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
        throw error;
    }
};

module.exports = sendEmail;