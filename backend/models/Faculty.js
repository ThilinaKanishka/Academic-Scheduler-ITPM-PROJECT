const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Full name
  email: { type: String, unique: true, required: true }, // Unique email
  department: { type: String, required: true }, // Faculty department
  designation: { type: String, required: true }, // Lecturer, Professor, etc.
  isAvailable: { type: Boolean, default: true } // Availability for scheduling
});

module.exports = mongoose.model("Faculty", FacultySchema);
