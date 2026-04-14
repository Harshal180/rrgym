const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const {
  addMember, getAllMembers, getAllTrainers,
  getMemberById, renewMembership, sendBill,
} = require("../controllers/memberController");

router.post("/add",        authMiddleware, adminOnly, upload.single("image"), addMember);
router.post("/renew",      authMiddleware, adminOnly, renewMembership);
router.post("/:id/send-bill", authMiddleware, adminOnly, sendBill);

router.get("/",            authMiddleware, adminOnly, getAllMembers);
router.get("/trainers",    authMiddleware, adminOnly, getAllTrainers);
router.get("/:id",         authMiddleware, getMemberById);

module.exports = router;
