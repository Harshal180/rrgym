const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const generateBillPDF = require("../utils/generateBillPDF");
const GYM_CONFIG = require("../config/gymConfig");

// ─── ADD MEMBER ───────────────────────────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, age, height, weight, memberType, membershipType, startDate, endDate } = req.body;
    const imageName = req.file ? req.file.filename : null;
    const today = new Date().toISOString().split("T")[0];

    if (memberType === "Member" && startDate < today) {
      return res.status(400).json({ message: "Start date cannot be before today" });
    }

    const [existing] = await db.query(
      "SELECT * FROM members WHERE email = ? OR mobile = ?",
      [email, mobile]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        message: "Member already exists",
        redirectToRenew: true,
        memberId: existing[0].id,
        mobile: existing[0].mobile,
      });
    }

    const [insertResult] = await db.query(
      `INSERT INTO members 
       (first_name, last_name, mobile, email, image, age, height, weight, member_type, membership_type, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [firstName, lastName, mobile, email, imageName, age, height, weight, memberType, membershipType, startDate, endDate]
    );

    res.json({ message: "Member added successfully", memberId: insertResult.insertId });
  } catch (err) {
    console.error("addMember error:", err);
    res.status(500).json({ message: "Error adding member" });
  }
};

// ─── GET ALL MEMBERS ──────────────────────────────────────────────────────────
const getAllMembers = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = "SELECT * FROM members WHERE member_type = 'Member'";
    const values = [];

    if (status && status !== "all") {
      sql += " AND status = ?";
      values.push(status);
    }
    if (search) {
      sql += " AND (id = ? OR mobile = ? OR email = ?)";
      values.push(search, search, search);
    }

    const [rows] = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("getAllMembers error:", err);
    res.status(500).json({ message: "Error fetching members" });
  }
};

// ─── GET ALL TRAINERS ─────────────────────────────────────────────────────────
const getAllTrainers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM members WHERE member_type = 'Trainer'");
    res.json(rows);
  } catch (err) {
    console.error("getAllTrainers error:", err);
    res.status(500).json({ message: "Error fetching trainers" });
  }
};

// ─── GET SINGLE MEMBER ────────────────────────────────────────────────────────
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.user_type === "admin";

    if (!isAdmin && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await db.query("SELECT * FROM members WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Member not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("getMemberById error:", err);
    res.status(500).json({ message: "Error fetching member" });
  }
};

// ─── RENEW MEMBERSHIP ─────────────────────────────────────────────────────────
const renewMembership = async (req, res) => {
  try {
    const { id, mobile, membershipType, startDate } = req.body;
    const memberId = parseInt(id);

    if (!memberId || !mobile || !membershipType || !startDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [result] = await db.query(
      "SELECT * FROM members WHERE id = ? AND mobile = ?",
      [memberId, mobile]
    );
    if (result.length === 0) return res.status(404).json({ message: "Member not found" });

    const planMonths = { "1 Month": 1, "3 Months": 3, "6 Months": 6, "1 Year": 12 };
    const months = planMonths[membershipType];
    if (!months) return res.status(400).json({ message: "Invalid plan" });

    const newEnd = new Date(startDate);
    newEnd.setMonth(newEnd.getMonth() + months);
    const formattedEndDate = newEnd.toISOString().split("T")[0];

    const [updateResult] = await db.query(
      `UPDATE members SET start_date = ?, end_date = ?, membership_type = ?, status = 'Active'
       WHERE id = ? AND mobile = ?`,
      [startDate, formattedEndDate, membershipType, memberId, mobile]
    );
    if (updateResult.affectedRows === 0) return res.status(404).json({ message: "Update failed" });

    res.json({ message: "Membership renewed successfully", newEndDate: formattedEndDate });
  } catch (err) {
    console.error("renewMembership error:", err);
    res.status(500).json({ message: "Error renewing membership" });
  }
};

// ─── SEND BILL PDF ────────────────────────────────────────────────────────────
const sendBill = async (req, res) => {
  try {
    const { id } = req.params;
    const [memberRows] = await db.query("SELECT * FROM members WHERE id = ?", [id]);
    if (memberRows.length === 0) return res.status(404).json({ message: "Member not found" });

    const member = memberRows[0];
    if (!member.email) return res.status(400).json({ message: "Member has no email address" });

    const [planRows] = await db.query(
      "SELECT * FROM membership_plans WHERE plan_name = ?",
      [member.membership_type]
    );
    const plan = planRows[0] || null;
    const price = plan ? Number(plan.price) : 0;
    const offerPrice = plan?.offer_price ? Number(plan.offer_price) : null;
    const paidAmount = offerPrice || price;
    const paymentDate = new Date(member.start_date).toLocaleDateString("en-IN");
    const expiryDate = new Date(member.end_date).toLocaleDateString("en-IN");
    const memberName = `${member.first_name} ${member.last_name}`;

    const pdfBuffer = await generateBillPDF({
      memberId: member.id, memberName,
      planName: plan?.plan_name ?? member.membership_type,
      durationMonths: plan?.duration_months ?? "—",
      price, offerPrice, paymentDate, expiryDate,
    });

    const balanceDue = Math.max(0, Number(price) - Number(paidAmount));
    const htmlBody = buildBillEmailHtml({ memberName, plan, member, paidAmount, balanceDue });
    const plainText = `Dear ${memberName}, your ${GYM_CONFIG.name} bill: Plan: ${plan?.plan_name ?? member.membership_type}, Amount: Rs. ${Number(paidAmount).toLocaleString("en-IN")}, Expiry: ${expiryDate}`;

    await sendEmail(
      member.email,
      `Your ${GYM_CONFIG.name} Membership Bill — ${plan?.plan_name ?? member.membership_type}`,
      plainText,
      htmlBody,
      [{ filename: `Bill_${memberName.replace(/\s+/g, "_")}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
    );

    res.json({ message: `Bill sent to ${member.email}` });
  } catch (err) {
    console.error("sendBill error:", err);
    res.status(500).json({ message: "Failed to send bill email" });
  }
};

// ─── PRIVATE HELPER ───────────────────────────────────────────────────────────
function buildBillEmailHtml({ memberName, plan, member, paidAmount, balanceDue }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
      <div style="background:#212529;padding:24px 32px;">
        <h2 style="color:#fff;margin:0;">${GYM_CONFIG.name}</h2>
        <p style="color:#aaa;margin:6px 0 0;font-size:13px;">Your Membership Bill</p>
      </div>
      <div style="padding:28px 32px;background:#fff;">
        <p>Dear <strong>${memberName}</strong>, your membership bill is attached.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
          <tr style="background:#f8f9fa;">
            <td style="padding:10px 14px;font-weight:bold;border:1px solid #dee2e6;">Plan</td>
            <td style="padding:10px 14px;border:1px solid #dee2e6;">${plan?.plan_name ?? member.membership_type}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:bold;border:1px solid #dee2e6;color:#198754;">Amount Paid</td>
            <td style="padding:10px 14px;border:1px solid #dee2e6;font-weight:bold;color:#198754;">Rs. ${Number(paidAmount).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:bold;border:1px solid #dee2e6;color:${balanceDue > 0 ? "#dc3545" : "#198754"};">Balance Due</td>
            <td style="padding:10px 14px;border:1px solid #dee2e6;font-weight:bold;color:${balanceDue > 0 ? "#dc3545" : "#198754"};">
              Rs. ${Number(balanceDue).toLocaleString("en-IN")}${balanceDue === 0 ? " (Fully Paid)" : ""}
            </td>
          </tr>
        </table>
      </div>
    </div>`;
}

module.exports = { addMember, getAllMembers, getAllTrainers, getMemberById, renewMembership, sendBill };
