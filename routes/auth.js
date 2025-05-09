const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const User = require("../models/User");

const router = express.Router();

// Register route to handle user registration
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      confirmPassword,
      branch,
      college,
      highestQualification,
      yearOfPassedOut,
      yearsOfExperience,
      interestedField,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Hash password before saving to the DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user in DB
    const newUser = new User({
      fullName,
      mobileNumber,
      email,
      password: hashedPassword, // Only store the hashed password
      confirmPassword: hashedPassword,
      branch,
      college,
      highestQualification,
      yearOfPassedOut,
      yearsOfExperience,
      interestedField,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Something went wrong during registration." });
  }
});

// Login route to authenticate user and generate JWT token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare provided password with the hashed password stored in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token (valid for 1 day)
    const token = jwt.sign(
      { userId: user._id, email: user.email },  // Payload
      process.env.JWT_SECRET,                    // Secret key from .env
      { expiresIn: "1d" }                        // Token expiration time
    );

    // Send token in the response
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong during login." });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    // Verify the token and extract user data
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user info to request object
    next(); // Proceed to the next route handler
  } catch (err) {
    return res.status(400).json({ error: "Invalid token" });
  }
};

// Example of a protected route that requires a valid JWT token
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // Fetch user data from DB using the userId from the token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user }); // Send user data
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Something went wrong while fetching the profile." });
  }
});

module.exports = router;
