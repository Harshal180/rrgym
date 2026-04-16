// utils/sendEmail.js
const nodemailer = require("nodemailer");

/**
 * @param {string} to
 * @param {string} subject
 * @param {string} text          - plain text fallback
 * @param {string|null} html     - optional HTML body
 * @param {Array}  attachments   - optional nodemailer attachments array
 *   e.g. [{ filename: "Bill.pdf", content: <Buffer>, contentType: "application/pdf" }]
 */
const sendEmail = async (to, subject, text, html = null, attachments = []) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `Gym Management <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            ...(html && { html }),
            ...(attachments.length && { attachments }),
        });

        console.log("Email sent to:", to);
    } catch (error) {
        console.error("Email error:", error);
        throw error;
    }
};

module.exports = sendEmail;
