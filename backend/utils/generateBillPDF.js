// utils/generateBillPDF.js
// Generates the gym bill as a PDF Buffer using pdfkit (server-side)
// Install: npm install pdfkit

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const GYM_CONFIG = require("../config/gymConfig");
const GYM_NAME    = GYM_CONFIG.name;
const GYM_EMAIL   = GYM_CONFIG.email;
const GYM_PHONE   = GYM_CONFIG.phone;
const GYM_ADDRESS = GYM_CONFIG.address;

// Logo path — adjust if your logo is stored elsewhere
const LOGO_PATH = path.join(__dirname, "../../frontend/public/assets/logoBlack.png");

/**
 * Generates a gym bill PDF and returns it as a Buffer.
 *
 * @param {Object} params
 * @param {number} params.memberId
 * @param {string} params.memberName
 * @param {string} params.planName
 * @param {number} params.durationMonths
 * @param {number} params.price
 * @param {number|null} params.offerPrice
 * @param {string} params.paymentDate   - e.g. "27/3/2026"
 * @param {string} params.expiryDate    - e.g. "27/4/2026"
 * @param {number} [params.paidAmountOverride]  - actual paid amount (if partial)
 * @param {number} [params.balanceDue]          - outstanding balance
 * @returns {Promise<Buffer>}
 */
const generateBillPDF = ({
    memberId,
    memberName,
    planName,
    durationMonths,
    price,
    offerPrice,
    paymentDate,
    expiryDate,
    paidAmountOverride,
    balanceDue,
}) => {
    return new Promise((resolve, reject) => {
        // Taller page to fit the balance row
        const doc = new PDFDocument({ size: [595, 540], margin: 40 });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const totalAmount = Math.round(offerPrice != null && offerPrice !== '' ? Number(offerPrice) : Number(price));
        const paidAmount = (paidAmountOverride !== undefined && paidAmountOverride !== null)
            ? Math.round(Number(paidAmountOverride))
            : totalAmount;
        const balance = (balanceDue !== undefined && balanceDue !== null)
            ? Math.round(Number(balanceDue))
            : Math.max(0, totalAmount - paidAmount);

        const pageWidth = 595;
        const margin = 40;
        const contentW = pageWidth - margin * 2;

        // ── LOGO ──────────────────────────────────────────────────────
        if (fs.existsSync(LOGO_PATH)) {
            doc.image(LOGO_PATH, margin, 30, { width: 65 });
        }

        // ── GYM HEADER ────────────────────────────────────────────────
        doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .text(GYM_NAME, margin + 80, 35);

        doc
            .font("Helvetica")
            .fontSize(9)
            .text(GYM_EMAIL, margin + 80, 53)
            .text(GYM_PHONE, margin + 80, 64)
            .text(GYM_ADDRESS, margin + 80, 75);

        // Date (right aligned)
        doc
            .fontSize(10)
            .text(`Date: ${paymentDate}`, margin, 53, { width: contentW, align: "right" });

        // ── DIVIDER ───────────────────────────────────────────────────
        doc
            .moveTo(margin, 110)
            .lineTo(pageWidth - margin, 110)
            .strokeColor("#cccccc")
            .lineWidth(1)
            .stroke();

        // ── CUSTOMER DETAILS ──────────────────────────────────────────
        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#000000")
            .text("Customer Details:", margin, 122);

        doc
            .font("Helvetica")
            .fontSize(10)
            .text(`Name:      ${memberName}`, margin, 138)
            .text(`Member ID: ${memberId}`, margin, 152);

        // ── TABLE ─────────────────────────────────────────────────────
        const tableTop = 178;
        const rowH = 22;
        const cols = [margin, 145, 245, 345, 440]; // x positions
        const colW = contentW;
        const headers = ["Plan", "Duration", "Start Date", "End Date", "Total Amount"];
        const values = [
            planName,
            `${durationMonths} Months`,
            paymentDate,
            expiryDate,
            `Rs. ${Number(totalAmount).toLocaleString("en-IN")}`,
        ];

        // Header row background
        doc
            .rect(margin, tableTop, colW, rowH)
            .fillColor("#212529")
            .fill();

        // Header text
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
        headers.forEach((h, i) => {
            doc.text(h, cols[i] + 5, tableTop + 6, { width: 95, lineBreak: false });
        });

        // Data row background
        doc
            .rect(margin, tableTop + rowH, colW, rowH)
            .fillColor("#f8f9fa")
            .fill();

        // Data row border
        doc
            .rect(margin, tableTop + rowH, colW, rowH)
            .strokeColor("#dee2e6")
            .lineWidth(0.5)
            .stroke();

        // Data text
        doc.fillColor("#000000").font("Helvetica").fontSize(10);
        values.forEach((v, i) => {
            doc.text(v, cols[i] + 5, tableTop + rowH + 6, { width: 95, lineBreak: false });
        });

        // ── PAYMENT SUMMARY ───────────────────────────────────────────
        const summaryY = tableTop + rowH * 2 + 18;

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#198754")
            .text(
                `Amount Paid: Rs. ${paidAmount.toLocaleString("en-IN")}`,
                margin,
                summaryY,
                { width: contentW, align: "right" }
            );

        // Balance Due row
        if (balance > 0) {
            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor("#dc3545")
                .text(
                    `Balance Due:  Rs. ${balance.toLocaleString("en-IN")}`,
                    margin,
                    summaryY + 18,
                    { width: contentW, align: "right" }
                );
        } else {
            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor("#198754")
                .text(
                    `Balance Due:  Rs. 0  (Fully Paid)`,
                    margin,
                    summaryY + 18,
                    { width: contentW, align: "right" }
                );
        }

        // Divider before footer
        doc
            .moveTo(margin, summaryY + 40)
            .lineTo(pageWidth - margin, summaryY + 40)
            .strokeColor("#cccccc")
            .lineWidth(0.5)
            .stroke();

        // ── FOOTER ────────────────────────────────────────────────────
        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#888888")
            .text(
                "Thank you for choosing RR POWER AND WELLNESS GYM!",
                margin,
                doc.page.height - 30,
                { width: contentW, align: "center" }
            );

        doc.end();
    });
};

module.exports = generateBillPDF;
