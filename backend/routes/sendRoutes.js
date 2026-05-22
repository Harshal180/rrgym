const express = require("express");
const router = express.Router();
const db = require("../config/db");
const sendSMS = require("../utils/sendSMS");
const sendEmail = require("../utils/sendEmail");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

// SEND TO EXISTING MEMBERS — Trainer only
router.post("/existing-members", authMiddleware, adminOnly, async (req, res) => {
    const { message, subject } = req.body;
    try {
        const [members] = await db.query("SELECT email, mobile FROM existing_members");
        for (let member of members) {
            const promises = [];
            if (member.email) promises.push(sendEmail(member.email, subject || "We Miss You at Our Gym!", message));
            if (member.mobile) promises.push(sendSMS(member.mobile, message));
            await Promise.all(promises);
        }
        res.json({ message: "Existing Members: Email + SMS sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEND TO ACTIVE MEMBERS — Trainer only
router.post("/members", authMiddleware, adminOnly, async (req, res) => {
    const { message, subject } = req.body;
    try {
        const [members] = await db.query("SELECT email, mobile FROM members");
        for (let member of members) {
            const promises = [];
            if (member.email) promises.push(sendEmail(member.email, subject || "Important Update from Our Gym", message));
            if (member.mobile) promises.push(sendSMS(member.mobile, message));
            await Promise.all(promises);
        }
        res.json({ message: "Active Members: Email + SMS sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
