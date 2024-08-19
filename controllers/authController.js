const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { JWT_SECRET } = require("../config/config");

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

// Register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
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

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetToken: otp,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired OTP" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetToken: otp,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired OTP" });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Show Reset Password Form
exports.showResetPasswordForm = async (req, res) => {
  res.send(`<html><body>
    <form action="/auth/verify-otp" method="POST">
      <input type="text" name="email" placeholder="Email" required />
      <input type="text" name="otp" placeholder="OTP" required />
      <button type="submit">Verify OTP</button>
    </form>
  </body></html>`);
};
