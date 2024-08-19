const User = require("../models/user");

// Get User Details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update User Role
exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== "Admin") {
      return res.status(403).json({ error: "Only admins can update roles" });
    }

    if (admin._id.equals(userId)) {
      return res
        .status(403)
        .json({ error: "Admin cannot change their own role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = newRole;
    await user.save();
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
