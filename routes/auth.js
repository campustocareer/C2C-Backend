const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const data = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { mobileNumber: data.mobileNumber }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    data.confirmPassword = undefined; // Optional: don’t store confirmPassword

    const newUser = new User(data);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
