const express = require("express");
const { createClassroom, getClassrooms, updateClassroom, deleteClassroom } = require("../controllers/classroomController");

const router = express.Router();

router.post("/", createClassroom);
router.get("/", getClassrooms);
router.put("/:id", updateClassroom);
router.delete("/:id", deleteClassroom);

module.exports = router;
