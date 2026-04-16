const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/authMiddleware");
const {
  loginLimiter, adminLogin, getAdminMe, changePassword,
  addTrainer, getTrainers, toggleTrainer, adminLogout,
} = require("../controllers/adminController");

router.post("/login",  loginLimiter, adminLogin);
router.post("/logout", adminLogout);

router.get("/me",               adminOnly, getAdminMe);
router.put("/change-password",  adminOnly, changePassword);

router.post("/trainers",              adminOnly, addTrainer);
router.get("/trainers",               adminOnly, getTrainers);
router.put("/trainers/:id/toggle",    adminOnly, toggleTrainer);

module.exports = router;
