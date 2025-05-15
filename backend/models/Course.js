const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "BSc Computer Science"
  description: { type: String }
});

module.exports = mongoose.model("Course", CourseSchema);
