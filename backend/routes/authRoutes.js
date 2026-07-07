import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Course from "../models/Courses.js";
import { protectWithJSON } from "./authMiddleware.js";

const { TokenExpiredError } = jwt;
const router = express.Router();

// ==========================================
// 1. ROUTE: POST /api/auth/signup
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use." });

    const existingName = await User.findOne({ username });
    if (existingName)
      return res.status(400).json({ error: "Username already in use." });

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

    // FIXED: Set cookie container
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Must be true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Try "none" if API and Front end are on different subdomains
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
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

    if (!user)
      return res.status(400).json({ error: "Invalid username or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid username or password." });

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // FIXED: Send token via httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        name: user.name, // <--- ADD THIS LINE
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ==========================================
// 3. FIXED: ROUTE: PUT /api/auth/update (Now standalone!)
// ==========================================
router.put("/update", protectWithJSON, async (req, res) => {
  try {
    const userId = req.user._id; // <-- Pull the ID straight from our custom middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { username, name, email, phone, address } = req.body;

    // Check for unique conflicts if username or email is being modified
    if (username && username !== user.username) {
      const conflict = await User.findOne({ username });
      if (conflict)
        return res.status(400).json({ error: "Username already in use." });
      user.username = username;
    }

    if (email && email !== user.email) {
      const conflict = await User.findOne({ email });
      if (conflict)
        return res.status(400).json({ error: "Email already in use." });
      user.email = email;
    }

    // Safely update remaining details if provided
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phoneNumber = phone;

    if (address) {
      user.address = {
        street: address.street || user.address?.street,
        city: address.city || user.address?.city,
        state: address.state || user.address?.state,
        zipCode: address.zipCode || user.address?.zipCode,
        country: address.country || user.address?.country || "USA",
      };
    }

    // Re-evaluate profile completeness flag based on updates
    user.fullP = !!(
      user.name &&
      user.phoneNumber &&
      user.address?.street &&
      user.address?.city &&
      user.address?.state &&
      user.address?.zipCode
    );

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        fullP: updatedUser.fullP,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error. Failed to update profile." });
  }
});

// ... keeping all your signup, login, and update routes exactly as they are ...

// ==========================================
// 4. ROUTE: GET /api/auth/me (Verifies token & returns real DB data)
// ==========================================
router.get("/me", protectWithJSON, async (req, res) => {
  try {
    // Passport already verified the token and found the user! It lives in req.user
    const user = req.user;

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name, // <--- ADD THIS LINE
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error validating session." });
  }
});

router.post("/add-course", protectWithJSON, async (req, res, next) => {
  try {
    // 1. Check if the user has fullP privileges
    if (req.user.fullP === false) {
      return res.status(403).json({
        error:
          "Complete profile information before adding courses to your schedule.",
      });
    }

    const { courseId } = req.body;
    const userId = req.user._id;

    // 2. Fetch the course to check capacity
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // 3. Enforce capacity limits safely
    const enrolledCount = course.enrolledStudents
      ? course.enrolledStudents.length
      : 0;
    const capacity = course.capacity || 30;
    if (enrolledCount >= capacity) {
      return res
        .status(400)
        .json({ error: "This course has reached its maximum capacity." });
    }

    // 4. Safely update BOTH the student and the course using $addToSet
    // (This creates the array if it's missing, and prevents duplicate signups!)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { schedule: courseId },
    });
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    res.status(200).json({ message: "Course successfully added to schedule!" });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 6. ROUTE: GET /my-schedule (Fetches the user's classes)
// ==========================================
router.get("/my-schedule", protectWithJSON, async (req, res, next) => {
  try {
    // .populate("schedule") swaps the saved ObjectIds with the actual Course data
    const user = await User.findById(req.user._id).populate("schedule");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back just the array of courses
    res.status(200).json(user.schedule);
  } catch (error) {
    next(error);
  }
});

export default router;
