const express = require("express");
const router = express.Router();
const {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/facultyController");

router.get("/", getAllFaculty);
router.post("/", createFaculty);
router.put("/:id", updateFaculty); // Update route
router.delete("/:id", deleteFaculty); // Delete route

module.exports = router;
