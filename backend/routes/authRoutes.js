import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const { TokenExpiredError } = jwt;
const router = express.Router();

// ==========================================
// 1. ROUTE: POST /api/auth/signup
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }
    const existingName = await User.findOne({ username });
    if (existingName) {
      return res.status(400).json({ error: "username already in use." });
    }

    let isUserAdmin = false;
    if (adminCode === process.env.ADMIN_SECRET) {
      isUserAdmin = true;
    } else if (adminCode && adminCode.trim() !== "") {
      return res.status(401).json({ error: "Invalid admin code." });
    }

    const newUser = new User({
      username,
      email,
      password,
      isAdmin: isUserAdmin,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "Account created successfully!",
      token: `Bearer ${token}`,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ==========================================
// 2. ROUTE: POST /api/auth/login
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    console.log("--- LOGIN DEBUG ---");
    console.log("Frontend sent username:", username);
    console.log("Database found user?:", user ? "YES" : "NO");

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password matched?:", isMatch);
    console.log("-------------------");

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Fixed typo: changed "Id" to "1d" (1 day)
    );

    res.status(200).json({
      message: "Login successful!",
      token: `Bearer ${token}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ==========================================
// 3. FIXED: ROUTE: PUT /api/auth/update (Now standalone!)
// ==========================================
router.put("/update", async (req, res) => {
  try {
    const { userId, username, name, email, phone, address } = req.body;

    // --- START: VALIDATION ---
    // Check if the new username is already taken by another user
    const existingUsername = await User.findOne({
      username: username,
      _id: { $ne: userId }, // $ne means "not equal"
    });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already in use." });
    }

    // Check if the new email is already taken by another user
    const existingEmail = await User.findOne({
      email: email,
      _id: { $ne: userId },
    });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already in use." });
    }
    // --- END: VALIDATION ---

    // 1. Determine if the profile is now complete
    const isProfileComplete = !!(
      name &&
      phone &&
      address?.street &&
      address?.city &&
      address?.state &&
      address?.zipCode
    );

    // 2. Construct the update payload
    const updateData = {
      username,
      name,
      email,
      phoneNumber: phone,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: "USA",
      },
      fullP: isProfileComplete, // 3. Set the fullP flag
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        fullP: updatedUser.fullP, // 4. Return the new fullP status
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ error: "Server error. Failed to update profile." });
  }
});

export default router;
