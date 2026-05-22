const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const {
  recordPayment, getMemberPayments, getPendingBalances,
  getAllPayments, collectBalance, getPaymentStats,
} = require("../controllers/paymentController");

router.post("/",                authMiddleware, adminOnly, recordPayment);
router.post("/collect-balance", authMiddleware, adminOnly, collectBalance);

router.get("/stats",            authMiddleware, adminOnly, getPaymentStats);
router.get("/pending",          authMiddleware, adminOnly, getPendingBalances);
router.get("/member/:memberId", authMiddleware, adminOnly, getMemberPayments);
router.get("/",                 authMiddleware, adminOnly, getAllPayments);

module.exports = router;
