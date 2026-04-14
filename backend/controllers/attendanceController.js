const db = require("../config/db");

// ─── MARK ATTENDANCE ──────────────────────────────────────────────────────────
const markAttendance = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: "Member ID required" });

    const isAdmin = req.user.user_type === "admin";
    if (!isAdmin && req.user.id !== parseInt(memberId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0];

    const [member] = await db.query(
      "SELECT id, first_name, last_name, end_date, status FROM members WHERE id = ?",
      [memberId]
    );
    if (member.length === 0) return res.status(404).json({ message: "Member does not exist" });

    const m = member[0];
    if (m.status === "Inactive") return res.status(403).json({ message: "Membership is Inactive" });

    const diffDays = Math.ceil((new Date(m.end_date) - new Date(today)) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return res.status(403).json({ message: "Membership Expired" });

    const [existing] = await db.query(
      "SELECT * FROM attendance WHERE member_id = ? AND date = ?",
      [memberId, today]
    );

    let action = "";
    if (existing.length === 0) {
      await db.query(
        "INSERT INTO attendance (member_id, date, in_time) VALUES (?, ?, ?)",
        [memberId, today, now]
      );
      action = "IN";
    } else {
      const record = existing[0];
      if (!record.out_time) {
        await db.query("UPDATE attendance SET out_time = ? WHERE id = ?", [now, record.id]);
        action = "OUT";
      } else {
        return res.status(400).json({ message: "Already marked IN & OUT today" });
      }
    }

    res.json({ message: `${action} marked`, remainingDays: diffDays, endDate: m.end_date });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET TODAY'S ATTENDANCE ───────────────────────────────────────────────────
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const [rows] = await db.query(
      `SELECT a.id, m.id AS member_id, m.first_name, m.last_name, m.end_date, a.in_time, a.out_time
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.date = ?
       ORDER BY a.id DESC`,
      [today]
    );
    res.json(rows);
  } catch (err) {
    console.error("getTodayAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ATTENDANCE BY DATE ───────────────────────────────────────────────────
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const [rows] = await db.query(
      `SELECT a.id, m.id AS member_id, m.first_name, m.last_name, m.end_date, a.in_time, a.out_time
       FROM attendance a
       JOIN members m ON a.member_id = m.id
       WHERE a.date = ?
       ORDER BY a.id DESC`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("getAttendanceByDate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { markAttendance, getTodayAttendance, getAttendanceByDate };
