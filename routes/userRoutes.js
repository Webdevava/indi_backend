// userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  getAllUsers,
  searchUsers,
  updateUserRole,
  registerUser,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/me", authMiddleware, getUserDetails);
router.get("/", authMiddleware, getAllUsers);
router.get("/search", authMiddleware, searchUsers);
router.put(
  "/update-role",
  authMiddleware,
  roleMiddleware(["Admin"]),
  updateUserRole
);
router.post(
  "/register",
  authMiddleware,
  roleMiddleware(["Admin"]),
  registerUser
);
router.delete(
  "/delete-user/:userId",
  authMiddleware,
  roleMiddleware(["Admin"]),
  deleteUser
);

module.exports = router;
