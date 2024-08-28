const User = require("../models/user");
const nodemailer = require("nodemailer");

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true, // Enable debug logging
  debug: true, // Include debug logs in the console
});

// Get User Details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  const {
    searchTerm,
    fullName,
    userName,
    emailId,
    role,
    status,
    userType,
    contactNo,
    company,
    department,
    designation,
    employeeId,
  } = req.query;

  try {
    let query = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (fullName) query.name = { $regex: fullName, $options: "i" };
    if (userName) query.username = { $regex: userName, $options: "i" };
    if (emailId) query.email = { $regex: emailId, $options: "i" };
    if (role) query.role = role;
    if (status) query.status = status;
    if (userType) query.userType = userType;
    if (contactNo) query.contact = contactNo;
    if (company) query.company = company;
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (employeeId) query.employeeid = employeeId;

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Register a new user (Admin functionality)
exports.registerUser = async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    role,
    contact,
    company,
    department,
    designation,
    employeeid,
  } = req.body;

  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== "Admin") {
      return res.status(403).json({ error: "Only admins can create users" });
    }

    const user = new User({
      name,
      username,
      email,
      password,
      role,
      contact,
      company,
      department,
      designation,
      employeeid,
    });

    await user.save();

    // Send registration email notification with styling
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Welcome to Inditronics</h2>
        <p style="font-size: 16px; color: #555;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="font-size: 16px; color: #555;">
          Your account has been successfully created. You can now access the Inditronics Dashboard with the role of <strong>${role}</strong>.
        </p>
        <p style="font-size: 16px; color: #555;">
          Name: <strong>${name}</strong><br/>
          Username: <strong>${username}</strong><br/>
          Email: <strong>${email}</strong><br/>
          Role: <strong>${role}</strong>
        </p>
        <p style="font-size: 16px; color: #555;">
          Please log in using your credentials to get started.
        </p>
        <a href="https://indi-dash-01.vercel.app" style="display: inline-block; margin: 20px 0; padding: 10px 20px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">
          Go to Dashboard
        </a>
        <p style="font-size: 14px; color: #999;">
          If you have any questions or need support, feel free to contact us.
        </p>
        <p style="font-size: 14px; color: #999;">
          Best regards,<br/>
          Inditronics Team
        </p>
      </div>
    `;

    await transporter.sendMail({
      to: user.email,
      subject: "Welcome to Inditronics - Account Created",
      html: emailContent,
    });

    res.status(201).json({ message: "User registered and email sent" });
  } catch (err) {
    if (err.code === 11000) {
      // Handle duplicate key error for unique fields
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ error: `${field} already exists` });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};




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

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete a user (Admin functionality)
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== "Admin") {
      return res.status(403).json({ error: "Only admins can delete users" });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure at least one Admin remains
    if (userToDelete.role === "Admin") {
      const adminCount = await User.countDocuments({ role: "Admin" });
      if (adminCount === 1) {
        return res.status(403).json({
          error: "Cannot delete the last Admin. Assign another Admin first.",
        });
      }
    }

    await userToDelete.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is ${otp}. It is valid for 1 hour.</p>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

