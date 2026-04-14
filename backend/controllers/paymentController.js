const db = require("../config/db");

// ─── HELPER ───────────────────────────────────────────────────────────────────
const toDateOnly = (val) => {
  if (!val) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(val))) return val;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
};

// ─── RECORD A PAYMENT ─────────────────────────────────────────────────────────
const recordPayment = async (req, res) => {
  try {
    const {
      member_id, plan_id, plan_name, total_amount, paid_amount,
      payment_date, payment_method = "Cash", payment_type = "new", notes = "",
    } = req.body;

    if (!member_id || !plan_name || !total_amount || !paid_amount || !payment_date) {
      return res.status(400).json({
        message: "member_id, plan_name, total_amount, paid_amount and payment_date are required",
      });
    }

    const safeDate = toDateOnly(payment_date);
    if (!safeDate) return res.status(400).json({ message: "Invalid payment_date value" });

    const balance_due = Math.max(0, Number(total_amount) - Number(paid_amount));

    await db.query(
      `INSERT INTO payments
       (member_id, plan_id, plan_name, total_amount, paid_amount, balance_due, payment_date, payment_method, payment_type, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [member_id, plan_id || null, plan_name, total_amount, paid_amount, balance_due, safeDate, payment_method, payment_type, notes]
    );

    res.status(201).json({ message: "Payment recorded", balance_due });
  } catch (err) {
    console.error("recordPayment error:", err);
    res.status(500).json({ message: "Error recording payment" });
  }
};

// ─── GET PAYMENTS FOR A MEMBER ────────────────────────────────────────────────
const getMemberPayments = async (req, res) => {
  try {
    const { memberId } = req.params;
    const [rows] = await db.query(
      `SELECT p.*, m.first_name, m.last_name, m.mobile
       FROM payments p
       JOIN members m ON p.member_id = m.id
       WHERE p.member_id = ?
       ORDER BY p.payment_date DESC, p.created_at DESC`,
      [memberId]
    );
    res.json(rows);
  } catch (err) {
    console.error("getMemberPayments error:", err);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

// ─── GET PENDING BALANCES ─────────────────────────────────────────────────────
const getPendingBalances = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
          p.member_id,
          m.first_name, m.last_name, m.mobile, m.email, m.status,
          m.membership_type,
          SUM(p.balance_due) AS total_balance_due,
          MAX(p.payment_date) AS last_payment_date
       FROM payments p
       JOIN members m ON p.member_id = m.id
       WHERE p.balance_due > 0
       GROUP BY p.member_id
       ORDER BY total_balance_due DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("getPendingBalances error:", err);
    res.status(500).json({ message: "Error fetching pending balances" });
  }
};

// ─── GET ALL PAYMENTS ─────────────────────────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = `
      SELECT p.*, m.first_name, m.last_name, m.mobile
      FROM payments p
      JOIN members m ON p.member_id = m.id
    `;
    const values = [];

    if (from && to) {
      sql += " WHERE p.payment_date BETWEEN ? AND ?";
      values.push(toDateOnly(from), toDateOnly(to));
    } else if (from) {
      sql += " WHERE p.payment_date >= ?";
      values.push(toDateOnly(from));
    }
    sql += " ORDER BY p.payment_date DESC, p.created_at DESC";

    const [rows] = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

// ─── COLLECT BALANCE ──────────────────────────────────────────────────────────
const collectBalance = async (req, res) => {
  try {
    const { member_id, amount, payment_method = "Cash", notes = "" } = req.body;
    if (!member_id || !amount) {
      return res.status(400).json({ message: "member_id and amount are required" });
    }

    const [pending] = await db.query(
      "SELECT * FROM payments WHERE member_id = ? AND balance_due > 0 ORDER BY payment_date DESC LIMIT 1",
      [member_id]
    );
    if (pending.length === 0) {
      return res.status(404).json({ message: "No pending balance found for this member" });
    }

    const record = pending[0];
    const collecting = Math.min(Number(amount), Number(record.balance_due));
    const newBalance = Math.max(0, Number(record.balance_due) - collecting);

    await db.query(
      "UPDATE payments SET balance_due = ?, paid_amount = paid_amount + ? WHERE id = ?",
      [newBalance, collecting, record.id]
    );

    await db.query(
      `INSERT INTO payments
       (member_id, plan_id, plan_name, total_amount, paid_amount, balance_due, payment_date, payment_method, payment_type, notes)
       VALUES (?, ?, ?, ?, ?, 0, CURDATE(), ?, 'balance', ?)`,
      [member_id, record.plan_id, record.plan_name, collecting, collecting, payment_method,
        notes || `Balance collected for ${record.plan_name}`]
    );

    res.json({ message: "Balance collected successfully", remaining_balance: newBalance });
  } catch (err) {
    console.error("collectBalance error:", err);
    res.status(500).json({ message: "Error collecting balance" });
  }
};

// ─── PAYMENT STATS ────────────────────────────────────────────────────────────
const getPaymentStats = async (req, res) => {
  try {
    const [totals] = await db.query(
      `SELECT
         COUNT(DISTINCT member_id) AS members_with_payments,
         SUM(paid_amount)          AS total_collected,
         SUM(balance_due)          AS total_pending,
         SUM(total_amount)         AS total_billed
       FROM payments`
    );

    const [monthly] = await db.query(
      `SELECT
         DATE_FORMAT(payment_date, '%Y-%m') AS month,
         SUM(paid_amount)                   AS collected,
         SUM(balance_due)                   AS pending
       FROM payments
       GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 6`
    );

    res.json({ summary: totals[0], monthly });
  } catch (err) {
    console.error("getPaymentStats error:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

module.exports = {
  recordPayment, getMemberPayments, getPendingBalances,
  getAllPayments, collectBalance, getPaymentStats,
};
