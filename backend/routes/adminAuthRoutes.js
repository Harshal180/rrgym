const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { adminOnly } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: "Too many attempts, try again later" } });

/* =========================================
   ADMIN LOGIN  —  POST /api/admin/login
   Body: { username, password }
========================================= */
router.post("/login", limiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Find admin by username
        const [rows] = await db.query(
            "SELECT * FROM admins WHERE username = ? AND is_active = 1",
            [username.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const admin = rows[0];

        // 🔥 Plain text password check
        if (password !== admin.password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Update last_login timestamp
        await db.query(
            "UPDATE admins SET last_login = NOW() WHERE id = ?",
            [admin.id]
        );

        // Sign JWT
        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                name: admin.name,
                role: admin.role,
                user_type: "admin",
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 8 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            admin: {
                id: admin.id,
                name: admin.name,
                username: admin.username,
                role: admin.role,
            },
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================
   GET CURRENT ADMIN
========================================= */
router.get("/me", adminOnly, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, username, role, last_login FROM admins WHERE id = ? AND is_active = 1",
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================
   CHANGE PASSWORD (PLAIN TEXT NOW)
========================================= */
router.put("/change-password", adminOnly, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const [rows] = await db.query(
            "SELECT password FROM admins WHERE id = ?",
            [req.user.id]
        );

        // 🔥 Plain text check
        if (currentPassword !== rows[0].password) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // 🔥 Store plain text password
        await db.query(
            "UPDATE admins SET password = ? WHERE id = ?",
            [newPassword, req.user.id]
        );

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================
   ADD TRAINER (PLAIN PASSWORD)
========================================= */
router.post("/trainers", adminOnly, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Only the gym owner can add trainer accounts" });
        }

        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ message: "Name, username and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const [existing] = await db.query(
            "SELECT id FROM admins WHERE username = ?",
            [username.trim().toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "Username already taken" });
        }

        // 🔥 Store plain password
        const [result] = await db.query(
            "INSERT INTO admins (name, username, password, role) VALUES (?, ?, ?, 'trainer')",
            [name.trim(), username.trim().toLowerCase(), password]
        );

        res.status(201).json({
            message: "Trainer account created successfully",
            trainerId: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================
   GET ALL TRAINERS
========================================= */
router.get("/trainers", adminOnly, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Owner access required" });
        }

        const [rows] = await db.query(
            "SELECT id, name, username, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================
   TOGGLE TRAINER ACTIVE
========================================= */
router.put("/trainers/:id/toggle", adminOnly, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Owner access required" });
        }

        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "You cannot disable your own account" });
        }

        await db.query(
            "UPDATE admins SET is_active = NOT is_active WHERE id = ?",
            [id]
        );

        res.json({ message: "Trainer account status updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================================
   LOGOUT
========================================= */
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out successfully" });
});

module.exports = router;