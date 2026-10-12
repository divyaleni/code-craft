const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  department: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: "Enter all details. Password must be at least 8 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email is already registered." });

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email is already registered." });
    res.status(500).json({ message: "Registration failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Enter email and password." });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ message: "Login successful.", token, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Login failed." });
  }
});

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please log in first." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

app.get("/api/students", authenticate, async (req, res) => {
  try {
    const students = await Student.find({ createdBy: req.userId }).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students." });
  }
});

app.post("/api/students", authenticate, async (req, res) => {
  try {
    const { name, email, department } = req.body;
    if (!name?.trim() || !email?.trim() || !department?.trim()) {
      return res.status(400).json({ message: "All student fields are required." });
    }
    const student = await Student.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      createdBy: req.userId
    });
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: "Unable to add student." });
  }
});

app.put("/api/students/:id", authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }
    const { name, email, department } = req.body;
    if (!name?.trim() || !email?.trim() || !department?.trim()) {
      return res.status(400).json({ message: "All student fields are required." });
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { name: name.trim(), email: email.trim().toLowerCase(), department: department.trim() },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: "Unable to update student." });
  }
});

app.delete("/api/students/:id", authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }
    const student = await Student.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Unable to delete student." });
  }
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Set JWT_SECRET to a random secret with at least 32 characters.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully!");
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

start().catch(err => {
  console.error("Server startup failed:", err.message);
  process.exit(1);
});
