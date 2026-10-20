
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("node:path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your separate AngularJS frontend folder
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Home page: open login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

// Database schemas
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Enter all details. Password must be at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Registration successful. Please log in."
    });
  } catch (err) {
    console.error("Registration error:", err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    return res.status(500).json({
      message: "Registration failed."
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Enter email and password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful.",
      token,
      name: user.name
    });
  } catch (err) {
    console.error("Login error:", err.message);

    return res.status(500).json({
      message: "Login failed."
    });
  }
});

// Authentication middleware
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({
      message: "Please log in first."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Session expired. Please log in again."
    });
  }
}

// View students
app.get("/api/students", authenticate, async (req, res) => {
  try {
    const students = await Student.find({
      createdBy: req.userId
    }).sort({ name: 1 });

    return res.json(students);
  } catch (err) {
    console.error("Fetch students error:", err.message);

    return res.status(500).json({
      message: "Failed to fetch students."
    });
  }
});

// Add student
app.post("/api/students", authenticate, async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof department !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !department.trim()
    ) {
      return res.status(400).json({
        message: "All student fields are required."
      });
    }

    const student = await Student.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      createdBy: req.userId
    });

    return res.status(201).json(student);
  } catch (err) {
    console.error("Add student error:", err.message);

    return res.status(400).json({
      message: "Unable to add student."
    });
  }
});

// Update student
app.put("/api/students/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID."
      });
    }

    const { name, email, department } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof department !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !department.trim()
    ) {
      return res.status(400).json({
        message: "All student fields are required."
      });
    }

    const student = await Student.findOneAndUpdate(
      { _id: id, createdBy: req.userId },
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim()
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    return res.json(student);
  } catch (err) {
    console.error("Update student error:", err.message);

    return res.status(400).json({
      message: "Unable to update student."
    });
  }
});

// Delete student
app.delete("/api/students/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID."
      });
    }

    const student = await Student.findOneAndDelete({
      _id: id,
      createdBy: req.userId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    return res.json({
      message: "Student deleted successfully."
    });
  } catch (err) {
    console.error("Delete student error:", err.message);

    return res.status(500).json({
      message: "Unable to delete student."
    });
  }
});

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

// Handle unexpected errors
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message: "Internal server error."
  });
});

// Start server after connecting to MongoDB
async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in backend/.env");
  }

  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must contain at least 32 characters."
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected successfully!");

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Server startup failed:", err.message);
  process.exit(1);
});
