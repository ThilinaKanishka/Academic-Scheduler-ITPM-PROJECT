const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  entries: [
    {
      module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
      classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
      faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
      timeSlot: { type: String, required: true },
    },
  ],
}, { timestamps: true });

// Add index for classroom and timeSlot to optimize conflict checking
TimetableSchema.index({ "entries.classroom": 1, "entries.timeSlot": 1 });

module.exports = mongoose.model("Timetable", TimetableSchema);