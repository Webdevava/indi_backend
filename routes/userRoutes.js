const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  updateUserRole,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/me", authMiddleware, getUserDetails);
router.put(
  "/update-role",
  authMiddleware,
  roleMiddleware(["Admin"]),
  updateUserRole
);

module.exports = router;
