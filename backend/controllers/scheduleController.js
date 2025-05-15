const Schedule = require("../models/Schedule");

// @desc Generate timetable based on selected modules
// @desc Generate a random timetable based on selected modules and faculty
exports.generateTimetable = async (req, res) => {
  try {
    const { modulesDetails, facultyIds } = req.body; // modulesDetails will include studentCount for each module

    const faculties = await Faculty.find({ '_id': { $in: facultyIds } });
    if (faculties.length !== facultyIds.length) {
      return res.status(400).json({ message: "Some faculties not found" });
    }

    // Generate timetable for each module
    const timetable = [];
    for (let moduleDetail of modulesDetails) {
      const { moduleId, studentCount } = moduleDetail;

      // Fetch the module
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(400).json({ message: `Module ${moduleId} not found` });
      }

      // Find a classroom with sufficient capacity
      const classroom = await Classroom.findOne({ capacity: { $gte: studentCount } });
      if (!classroom) {
        return res.status(400).json({ message: `No classroom found for ${module.title} with sufficient capacity` });
      }

      // Assign faculty in a round-robin fashion
      const faculty = faculties[ timetable.length % faculties.length ];

      // Add the generated schedule entry
      timetable.push({
        moduleName: module.title,
        facultyName: faculty.name,
        roomNumber: classroom.roomNumber,
        studentCount: classroom.capacity,
      });
    }

    res.status(200).json({
      message: "Timetable generated successfully",
      timetable,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// @desc Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("faculty", "name email department")
      .populate("module", "title description")
      .populate("classroom", "roomNumber capacity");

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { faculty, module, classroom, startTime, endTime } = req.body;

    // Check for faculty availability
    const facultyConflict = await Schedule.findOne({
      faculty,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (facultyConflict) {
      return res.status(400).json({ message: "Faculty is already scheduled for this time slot." });
    }

    // Check for classroom availability
    const classroomConflict = await Schedule.findOne({
      classroom,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (classroomConflict) {
      return res.status(400).json({ message: "Classroom is already booked for this time slot." });
    }

    const schedule = new Schedule({ faculty, module, classroom, startTime, endTime });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: "Error creating schedule", error });
  }
};

// @desc Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting schedule", error });
  }
};

// @desc Get timetable with faculty name, module name, and room number
// @desc Get timetable with faculty name, module name, room number, and student count
exports.getTimetable = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("faculty", "name")  // Populate faculty name
      .populate("module", "title")  // Populate module title
      .populate("classroom", "roomNumber capacity"); // Populate classroom roomNumber and capacity

    const timetable = schedules.map(schedule => ({
      facultyName: schedule.faculty.name,
      moduleName: schedule.module.title,
      roomNumber: schedule.classroom.roomNumber,
      studentCount: schedule.classroom.capacity, // Student count (capacity of the classroom)
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }));

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


