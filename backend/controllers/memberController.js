const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const generateBillPDF = require("../utils/generateBillPDF");
const GYM_CONFIG = require("../config/gymConfig");

// ─── ADD MEMBER ───────────────────────────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, age, height, weight, memberType, membershipType, personalTraining, startDate, endDate } = req.body;
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

    const ptValue = personalTraining && personalTraining !== "No" ? personalTraining : "No";

    const [insertResult] = await db.query(
      `INSERT INTO members 
       (first_name, last_name, mobile, email, image, age, height, weight, member_type, membership_type, personal_training, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [firstName, lastName, mobile, email, imageName, age, height, weight, memberType, membershipType, ptValue, startDate, endDate]
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
    const { id, mobile, membershipType, personalTraining, startDate } = req.body;
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

    const ptValue = personalTraining && personalTraining !== "No" ? personalTraining : "No";

    const [updateResult] = await db.query(
      `UPDATE members SET start_date = ?, end_date = ?, membership_type = ?, personal_training = ?, status = 'Active'
       WHERE id = ? AND mobile = ?`,
      [startDate, formattedEndDate, membershipType, ptValue, memberId, mobile]
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
    const membershipPrice = plan ? Number(plan.price) : 0;
    const offerPrice = plan?.offer_price ? Number(plan.offer_price) : null;
    const effectiveMembershipPrice = offerPrice || membershipPrice;

    // Fetch PT plan if member has one
    let ptPlan = null;
    let ptPrice = 0;
    if (member.personal_training && member.personal_training !== "No") {
      const [ptRows] = await db.query(
        "SELECT * FROM personal_training_plans WHERE plan_name = ?",
        [member.personal_training]
      );
      ptPlan = ptRows[0] || null;
      if (ptPlan) {
        ptPrice = Math.round(Number(ptPlan.offer_price != null && ptPlan.offer_price !== "" ? ptPlan.offer_price : ptPlan.price));
      }
    }

    const totalAmount = effectiveMembershipPrice + ptPrice;

    // Use paid amount and balance from request body if provided (for accurate bills right after add/renew)
    // req.body.price = paidAmountOverride sent from frontend
    const paidAmount = req.body?.price != null ? Math.round(Number(req.body.price)) : totalAmount;
    const balanceDue = req.body?.balanceDue != null
      ? Math.round(Number(req.body.balanceDue))
      : Math.max(0, totalAmount - paidAmount);
    const paymentDate = new Date(member.start_date).toLocaleDateString("en-IN");
    const expiryDate = new Date(member.end_date).toLocaleDateString("en-IN");
    const memberName = `${member.first_name} ${member.last_name}`;

    const pdfBuffer = await generateBillPDF({
      memberId: member.id, memberName,
      planName: plan?.plan_name ?? member.membership_type,
      durationMonths: plan?.duration_months ?? "—",
      price: membershipPrice,
      offerPrice,
      ptPlanName: ptPlan?.plan_name ?? null,
      ptPrice: ptPrice > 0 ? ptPrice : null,
      paymentDate, expiryDate,
      paidAmountOverride: paidAmount,
      balanceDue,
    });

    const htmlBody = buildBillEmailHtml({ memberName, plan, member, ptPlan, ptPrice, paidAmount, totalAmount, balanceDue });
    const plainText = `Dear ${memberName}, your ${GYM_CONFIG.name} bill: Plan: ${plan?.plan_name ?? member.membership_type}${ptPlan ? ` + ${ptPlan.plan_name}` : ""}, Total: Rs. ${totalAmount.toLocaleString("en-IN")}, Expiry: ${expiryDate}`;

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
function buildBillEmailHtml({ memberName, plan, member, ptPlan, ptPrice, paidAmount, totalAmount, balanceDue }) {
  const ptRow = ptPlan && ptPrice > 0 ? `
          <tr style="background:#eef4ff;">
            <td style="padding:10px 14px;font-weight:bold;border:1px solid #c8daff;color:#003580;">Personal Training</td>
            <td style="padding:10px 14px;border:1px solid #c8daff;color:#003580;">${ptPlan.plan_name} — Rs. ${Number(ptPrice).toLocaleString("en-IN")}</td>
          </tr>
          <tr style="background:#e8e8e8;">
            <td style="padding:10px 14px;font-weight:bold;border:1px solid #cccccc;">Total</td>
            <td style="padding:10px 14px;border:1px solid #cccccc;font-weight:bold;">Rs. ${Number(totalAmount).toLocaleString("en-IN")}</td>
          </tr>` : "";

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
            <td style="padding:10px 14px;font-weight:bold;border:1px solid #dee2e6;">Membership Plan</td>
            <td style="padding:10px 14px;border:1px solid #dee2e6;">${plan?.plan_name ?? member.membership_type}</td>
          </tr>${ptRow}
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