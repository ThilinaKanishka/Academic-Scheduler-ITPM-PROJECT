const express = require("express");
const router = express.Router();
const { getTimetable, generateTimetable, getAllSchedules, createSchedule, deleteSchedule } = require("../controllers/scheduleController");

router.get("/timetable", getTimetable); // Fetch all schedules
router.post("/generate", generateTimetable); // Generate timetable based on selected modules
router.get("/", getAllSchedules);
router.post("/", createSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;
