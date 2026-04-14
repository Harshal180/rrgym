const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const { getAllPlans, updatePlan } = require("../controllers/planController");

router.get("/",      getAllPlans);                            // public
router.put("/:id",   authMiddleware, adminOnly, updatePlan);

module.exports = router;
