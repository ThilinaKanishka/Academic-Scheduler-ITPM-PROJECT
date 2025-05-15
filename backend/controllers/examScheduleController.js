const ExamSchedule = require("../models/ExamSchedule");
const Classroom = require("../models/Classroom");

// @desc Get all exam schedules
exports.getAllExamSchedules = async (req, res) => {
  try {
    const exams = await ExamSchedule.find()
      .populate("module", "title")
      .populate("course", "name")
      .populate("faculty", "name")
      .populate("classroom", "roomNumber capacity classroomType");
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exam schedules", error });
  }
};

// @desc Get a single exam schedule by ID
exports.getExamScheduleById = async (req, res) => {
  try {
    const exam = await ExamSchedule.findById(req.params.id)
      .populate("module", "title")
      .populate("course", "name")
      .populate("faculty", "name")
      .populate("classroom", "name location");

    if (!exam) {
      return res.status(404).json({ message: "Exam schedule not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving exam schedule", error });
  }
};

exports.getAvailableClassrooms = async (req, res) => {
  try {
    const { dateTime } = req.query;
    if (!dateTime) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    // Find exams that conflict with the requested time
    const conflictingExams = await ExamSchedule.find({
      examDate: new Date(dateTime)
    });

    // Get all classrooms
    const allClassrooms = await Classroom.find();

    // Filter out classrooms that are already booked
    const bookedClassroomIds = conflictingExams.map(exam => exam.classroom.toString());
    const availableClassrooms = allClassrooms.filter(
      classroom => !bookedClassroomIds.includes(classroom._id.toString())
    );

    res.status(200).json(availableClassrooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available classrooms", error });
  }
};

// @desc Create new exam schedule
exports.createExamSchedule = async (req, res) => {
  try {
    const { module, course, faculty, classroom, examDate, startTime, endTime, duration } = req.body;
    
    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime) || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM" });
    }

    // Check if end time is after start time
    if (startTime >= endTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Check for conflicts
    const existingExam = await ExamSchedule.findOne({
      classroom,
      examDate: new Date(examDate),
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (existingExam) {
      return res.status(400).json({ 
        message: `Classroom is already booked from ${existingExam.startTime} to ${existingExam.endTime}` 
      });
    }

    const exam = new ExamSchedule({ 
      module, 
      course, 
      faculty, 
      classroom, 
      examDate: new Date(examDate),
      startTime,
      endTime,
      duration
    });
    
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: "Error creating exam schedule", error: error.message });
  }
};

// @desc Update an exam schedule
exports.updateExamSchedule = async (req, res) => {
  try {
    const { module, course, faculty, classroom, examDate } = req.body;

    // Check if classroom is already booked at this time (excluding current exam)
    const existingExam = await ExamSchedule.findOne({
      _id: { $ne: req.params.id },
      classroom,
      examDate: new Date(examDate)
    });

    if (existingExam) {
      return res.status(400).json({ message: "Classroom is already booked at this time" });
    }

    const updatedExam = await ExamSchedule.findByIdAndUpdate(
      req.params.id,
      { module, course, faculty, classroom, examDate },
      { new: true, runValidators: true }
    ).populate("module course faculty classroom");

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam schedule not found" });
    }

    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(400).json({ message: "Error updating exam schedule", error: error.message });
  }
};

// @desc Delete an exam schedule
exports.deleteExamSchedule = async (req, res) => {
  try {
    const deletedExam = await ExamSchedule.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      return res.status(404).json({ message: "Exam schedule not found" });
    }
    res.status(200).json({ message: "Exam schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting exam schedule", error });
  }
};