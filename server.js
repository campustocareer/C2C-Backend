const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express(); // ✅ Define app before using it


app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.3:5173'], // add your local IP and frontend URLs
  credentials: true
}));


app.use(cors()); // ✅ Use CORS after app is defined
app.use(bodyParser.json());

app.use("/api", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
