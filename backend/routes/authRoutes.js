import express from "express";
import User from "../models/User.js"; // Adjust this path if your model is in a different folder

const router = express.Router();

// Route: POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 2. Check the admin code
    let isUserAdmin = false;

    // Make sure ADMIN_SECRET is in your .env file!
    if (adminCode === process.env.ADMIN_SECRET) {
      isUserAdmin = true;
    } else if (adminCode && adminCode.trim() !== "") {
      return res.status(401).json({ error: "Invalid admin code." });
    }

    // 3. Create the new user
    const newUser = new User({
      name,
      email,
      password,
      isAdmin: isUserAdmin,
    });

    // (Your User model's "pre-save" hook will automatically hash the password here!)
    await newUser.save();

    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// Route: POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Notice we say "Invalid email or password" so hackers don't know which one they got wrong!
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // 2. Compare the typed password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // 3. Success! Send back the user data
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
