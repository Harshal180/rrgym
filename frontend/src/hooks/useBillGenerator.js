// src/hooks/useBillGenerator.js
import jsPDF from "jspdf";
import GYM_CONFIG from "../config/gymConfig";

const useBillGenerator = () => {
  const generateBill = ({
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
    logo = GYM_CONFIG.logoBlack,
  }) => {
    const totalAmount = Math.round(
      offerPrice != null && offerPrice !== "" ? Number(offerPrice) : Number(price)
    );
    const paidAmount =
      paidAmountOverride !== undefined && paidAmountOverride !== null
        ? Math.round(Number(paidAmountOverride))
        : totalAmount;
    const balance =
      balanceDue !== undefined && balanceDue !== null
        ? Math.round(Number(balanceDue))
        : Math.max(0, totalAmount - paidAmount);

    const contentHeight = 210;
    const doc = new jsPDF({ unit: "mm", format: [210, contentHeight] });
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── LOGO ──────────────────────────────────────────────────────
    if (logo) {
      doc.addImage(logo, "PNG", 14, 10, 25, 25);
    }

    // ── HEADER ────────────────────────────────────────────────────
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(GYM_CONFIG.name, 45, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(GYM_CONFIG.email, 45, 24);
    doc.text(GYM_CONFIG.phone, 45, 29);
    doc.text(GYM_CONFIG.address, 45, 34);

    doc.setFontSize(10);
    doc.text(`Date: ${paymentDate}`, pageWidth - 65, 24);

    doc.line(14, 42, pageWidth - 14, 42);

    // ── CUSTOMER INFO ──────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.text("Customer Details:", 14, 50);

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${memberName}`, 14, 57);
    doc.text(`Member ID: ${memberId}`, 14, 63);

    // ── TABLE ──────────────────────────────────────────────────────
    const startY = 75;
    const col1 = 20, col2 = 55, col3 = 85, col4 = 115, col5 = 148;

    // Header row
    doc.setFillColor(0, 0, 0);
    doc.rect(14, startY, pageWidth - 28, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Plan",      col1, startY + 6);
    doc.text("Duration",  col2, startY + 6);
    doc.text("Start",     col3, startY + 6);
    doc.text("End",       col4, startY + 6);
    doc.text("Total Amt", col5, startY + 6);

    doc.setTextColor(0, 0, 0);

    // Data row
    doc.setFont("helvetica", "normal");
    doc.rect(14, startY + 8, pageWidth - 28, 8);

    doc.text(planName,                                                        col1, startY + 14);
    doc.text(`${durationMonths} Months`,                                      col2, startY + 14);
    doc.text(paymentDate,                                                     col3, startY + 14);
    doc.text(expiryDate,                                                      col4, startY + 14);
    doc.text(`Rs. ${Number(totalAmount).toLocaleString("en-IN")}`,            col5, startY + 14);

    // ── PAYMENT SUMMARY ────────────────────────────────────────────
    const summaryY = startY + 30;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 135, 84);
    doc.text(
      `Amount Paid: Rs. ${paidAmount.toLocaleString("en-IN")}`,
      pageWidth - 14,
      summaryY,
      { align: "right" }
    );

    if (balance > 0) {
      doc.setTextColor(220, 53, 69);
      doc.text(
        `Balance Due:  Rs. ${balance.toLocaleString("en-IN")}`,
        pageWidth - 14,
        summaryY + 8,
        { align: "right" }
      );
    } else {
      doc.setTextColor(25, 135, 84);
      doc.text(
        `Balance Due:  Rs. 0  (Fully Paid)`,
        pageWidth - 14,
        summaryY + 8,
        { align: "right" }
      );
    }

    doc.setTextColor(0, 0, 0);

    // ── FOOTER ────────────────────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(136, 136, 136);
    doc.text(
      `Thank you for choosing ${GYM_CONFIG.name}!`,
      pageWidth / 2,
      contentHeight - 10,
      { align: "center" }
    );

    doc.save(`Bill_${memberName}.pdf`);
  };

  return { generateBill };
};

export default useBillGenerator;
