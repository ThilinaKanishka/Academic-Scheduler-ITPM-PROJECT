const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");

// Import Routes
const facultyRoutes = require("./routes/facultyRoutes");
const courseRoutes = require("./routes/courseRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const examScheduleRoutes = require("./routes/examScheduleRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Static files middleware - MUST come before routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.pdf') {
      res.set('Content-Type', 'application/pdf');
    }
  }
}));

// Routes
app.use("/api/faculty", facultyRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/exams", examScheduleRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/auth", authRoutes);

// 404 handler for /uploads - MUST come after static but before general 404
app.use('/uploads', (req, res) => {
  res.status(404).json({ error: 'PDF not found' });
});

// Basic route
app.get("/", (req, res) => {
  res.send("Academic Scheduler Backend is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});