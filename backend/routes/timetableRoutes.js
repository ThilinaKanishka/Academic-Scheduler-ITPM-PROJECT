const express = require("express");
const router = express.Router();
const { 
  generateTimetable, 
  getTimetables, 
  getTimetableByTitle,
  getTimetableNames,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} = require("../controllers/timetableController");

router.post("/generate", generateTimetable);
router.get("/", getTimetables);
router.get("/names", getTimetableNames); // Add this new route
router.get("/:title", getTimetableByTitle);
router.post("/:title/entries", addTimetableEntry);
router.put("/:title/entries/:entryId", updateTimetableEntry);
router.delete("/:title/entries/:entryId", deleteTimetableEntry);

module.exports = router;