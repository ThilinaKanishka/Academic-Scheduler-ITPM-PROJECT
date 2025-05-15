const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

// Prevent scheduling conflicts
ScheduleSchema.pre("save", async function (next) {
  const existingSchedules = await mongoose.model("Schedule").find({
    classroom: this.classroom,
    $or: [
      { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } },
    ],
  });

  if (existingSchedules.length > 0) {
    const error = new Error("Schedule conflict detected! Classroom already booked.");
    return next(error);
  }

  next();
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
