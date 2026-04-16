const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const { markAttendance, getTodayAttendance, getAttendanceByDate } = require("../controllers/attendanceController");

router.post("/mark",         authMiddleware, markAttendance);
router.get("/today",         authMiddleware, adminOnly, getTodayAttendance);
router.get("/report/:date",  authMiddleware, adminOnly, getAttendanceByDate);

module.exports = router;
