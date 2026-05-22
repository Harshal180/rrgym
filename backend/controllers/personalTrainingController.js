const db = require("../config/db");

// ─── GET ALL PERSONAL TRAINING PLANS (public) ────────────────────────────────
const getAllPTPlans = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM personal_training_plans ORDER BY duration_months ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("getAllPTPlans error:", err);
    res.status(500).json({ message: "Error fetching personal training plans" });
  }
};

// ─── UPDATE PERSONAL TRAINING PLAN ───────────────────────────────────────────
const updatePTPlan = async (req, res) => {
  try {
    const { price, offer_price } = req.body;
    const { id } = req.params;

    await db.query(
      "UPDATE personal_training_plans SET price = ?, offer_price = ? WHERE id = ?",
      [price, offer_price || null, id]
    );
    res.json({ message: "Personal training plan updated successfully" });
  } catch (err) {
    console.error("updatePTPlan error:", err);
    res.status(500).json({ message: "Error updating personal training plan" });
  }
};

module.exports = { getAllPTPlans, updatePTPlan };
