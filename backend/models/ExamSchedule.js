// models/ExamSchedule.js
const mongoose = require("mongoose");

const ExamScheduleSchema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  examDate: { type: Date, required: true }, // Date of the exam
  startTime: { type: String, required: true }, // Format: "HH:MM"
  endTime: { type: String, required: true }, // Format: "HH:MM"
  duration: { type: Number, required: true } // Duration in minutes
});

// Prevent classroom conflict
ExamScheduleSchema.pre("save", async function (next) {
  const examDate = new Date(this.examDate);
  const startDateTime = new Date(examDate);
  const endDateTime = new Date(examDate);
  
  // Parse start and end times
  const [startHours, startMinutes] = this.startTime.split(':').map(Number);
  const [endHours, endMinutes] = this.endTime.split(':').map(Number);
  
  startDateTime.setHours(startHours, startMinutes, 0, 0);
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  // Find conflicting exams
  const conflict = await mongoose.model("ExamSchedule").findOne({
    classroom: this.classroom,
    examDate: this.examDate,
    $or: [
      {
        // New exam starts during existing exam
        startTime: { $lte: this.startTime },
        endTime: { $gt: this.startTime }
      },
      {
        // New exam ends during existing exam
        startTime: { $lt: this.endTime },
        endTime: { $gte: this.endTime }
      },
      {
        // New exam completely overlaps existing exam
        startTime: { $gte: this.startTime },
        endTime: { $lte: this.endTime }
      }
    ]
  });

  if (conflict) {
    return next(new Error(`Scheduling conflict: Classroom is already booked from ${conflict.startTime} to ${conflict.endTime}`));
  }

  next();
});

module.exports = mongoose.model("ExamSchedule", ExamScheduleSchema);