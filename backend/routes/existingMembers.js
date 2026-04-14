const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

// GET all existing members — Trainer only
router.get("/", authMiddleware, adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM existing_members ORDER BY deleted_at DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching existing members:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
