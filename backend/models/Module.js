// Module.js
const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  pdfs: [{
    title: String,
    filePath: String,
    originalName: String,
    uploadDate: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("Module", ModuleSchema);