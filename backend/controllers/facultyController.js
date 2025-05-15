const Faculty = require("../models/Faculty");

// @desc Get all faculty members
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Create new faculty member
exports.createFaculty = async (req, res) => {
  try {
    const { name, email, department, designation } = req.body;

    // Validate data
    if (!name || !email || !department || !designation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new Faculty instance
    const faculty = new Faculty({
      name,
      email,
      department,
      designation,
    });

    await faculty.save();
    res.status(201).json(faculty); // Return the created faculty object
  } catch (error) {
    res.status(400).json({ message: "Error creating faculty", error });
  }
};

// @desc Update faculty member
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation } = req.body;

    // Find and update faculty
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name, email, department, designation },
      { new: true, runValidators: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    res.status(200).json(updatedFaculty);
  } catch (error) {
    res.status(400).json({ message: "Error updating faculty", error });
  }
};


// @desc Delete faculty member
exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete faculty
    const deletedFaculty = await Faculty.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    res.status(200).json({ message: "Faculty member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting faculty", error });
  }
};
