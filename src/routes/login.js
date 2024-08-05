const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/login");
const authenticateToken = require("./user");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    user.active = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "10h" }
    );
    console.log("Generated Token:", token);

    res.json({
      token,
      user,
      email: user.email,
      name: user.name,
      address: user.address,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    address,
    age,
    gender,
    country,
    username,
    number,
  } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send("User already registered, please try to login");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      address,
      age,
      gender,
      country,
      number,
      username,
    });

    const savedUser = await newUser.save();
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email },
      JWT_SECRET,
      { expiresIn: "10h" }
    );
    res.status(201).json({ token, user: savedUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout route
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.active = false;
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// for password changed

router.post("/profile/password", authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
  
    try {
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid current password" });
      }
  
      // Hash the new password before saving
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update user's password in the database
      user.password = encryptedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;



// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   message: "Too many login attempts from this IP, please try again later.",
//   statusCode: 429 // Status code to return when max limit is reached
// });