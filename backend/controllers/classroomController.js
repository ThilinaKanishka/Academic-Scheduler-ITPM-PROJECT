const Classroom = require("../models/Classroom");

// Create a Classroom
exports.createClassroom = async (req, res) => {
  try {
    const { roomNumber, capacity, classroomType, hasProjector, additionalTools } = req.body;
    const classroom = new Classroom({ roomNumber, capacity, classroomType, hasProjector, additionalTools });
    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    res.status(400).json({ message: "Error creating classroom", error });
  }
};

// Get All Classrooms
exports.getClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching classrooms", error });
  }
};

// Update Classroom
exports.updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, capacity, classroomType, hasProjector, additionalTools } = req.body;

    const updatedClassroom = await Classroom.findByIdAndUpdate(
      id,
      { roomNumber, capacity, classroomType, hasProjector, additionalTools },
      { new: true }
    );

    if (!updatedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res.status(200).json(updatedClassroom);
  } catch (error) {
    res.status(400).json({ message: "Error updating classroom", error });
  }
};

// Delete Classroom
exports.deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    await Classroom.findByIdAndDelete(id);
    res.status(200).json({ message: "Classroom deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting classroom", error });
  }
};
