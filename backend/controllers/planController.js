const db = require("../config/db");

// ─── GET ALL PLANS (public) ───────────────────────────────────────────────────
const getAllPlans = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM membership_plans ORDER BY duration_months ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("getAllPlans error:", err);
    res.status(500).json({ message: "Error fetching plans" });
  }
};

// ─── UPDATE PLAN ──────────────────────────────────────────────────────────────
const updatePlan = async (req, res) => {
  try {
    const { price, offer_price } = req.body;
    const { id } = req.params;

    await db.query(
      "UPDATE membership_plans SET price = ?, offer_price = ? WHERE id = ?",
      [price, offer_price || null, id]
    );
    res.json({ message: "Plan updated successfully" });
  } catch (err) {
    console.error("updatePlan error:", err);
    res.status(500).json({ message: "Error updating plan" });
  }
};

module.exports = { getAllPlans, updatePlan };
