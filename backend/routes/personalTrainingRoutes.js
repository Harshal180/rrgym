const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const { getAllPTPlans, updatePTPlan } = require("../controllers/personalTrainingController");

router.get("/",      getAllPTPlans);                              // public
router.put("/:id",   authMiddleware, adminOnly, updatePTPlan);   // admin only

module.exports = router;
