const express = require("express");
const router = express.Router();
const {
  getAllExamSchedules,
  getExamScheduleById,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  getAvailableClassrooms
} = require("../controllers/examScheduleController");

router.get("/", getAllExamSchedules);
router.get("/available-classrooms", getAvailableClassrooms);
router.get("/:id", getExamScheduleById);
router.post("/", createExamSchedule);
router.put("/:id", updateExamSchedule);
router.delete("/:id", deleteExamSchedule);

module.exports = router;