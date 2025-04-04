const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      fullName,
      mobileNumber,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword, // optional to store
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
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
