const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  mobileNumber: String,
  email: { type: String, unique: true },
  password: String,
  confirmPassword: String,
  branch: String,
  college: String,
  highestQualification: String,
  yearOfPassedOut: String,
  yearsOfExperience: String,
  interestedField: String,
});

module.exports = mongoose.model("User", userSchema);
