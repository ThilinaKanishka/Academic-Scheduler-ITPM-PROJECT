const Timetable = require("../models/Timetable");

// Helper to get random day
const getRandomDay = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return days[Math.floor(Math.random() * days.length)];
};

// Helper to get random time slot between 8:30 AM and 5:30 PM
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 8;
  const startMinute = 30;
  const endHour = 17;
  const slotDuration = 60; // in minutes

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute of [0, 30]) {
      const start = new Date(0, 0, 0, hour, minute);
      const end = new Date(start.getTime() + slotDuration * 60000);
      if (end.getHours() > 17 || (end.getHours() === 17 && end.getMinutes() > 30)) break;

      const formatTime = (date) =>
        date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      slots.push(`${formatTime(start)} - ${formatTime(end)}`);
    }
  }
  return slots;
};

// Main timetable generator
const generateTimetable = async (req, res) => {
  const { title, entries } = req.body;

  if (!title || !entries || entries.length < 4) {
    return res.status(400).json({ message: "Title and at least 4 entries are required." });
  }

  try {
    const existingTimetable = await Timetable.findOne({ title });
    if (existingTimetable) {
      return res.status(400).json({ message: "A timetable with this title already exists." });
    }

    const timeSlots = generateTimeSlots();

    const timetableEntries = entries.map((entry) => {
      const day = getRandomDay();
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      return {
        module: entry.module,
        classroom: entry.classroom,
        faculty: entry.faculty,
        timeSlot: `${day} ${time}`,
      };
    });

    const newTimetable = new Timetable({ title, entries: timetableEntries });
    await newTimetable.save();

    res.status(201).json({ message: "Timetable generated successfully", timetable: newTimetable });
  } catch (error) {
    console.error("Error generating timetable:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get all timetables
const getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find().populate("entries.module", "title").populate("entries.classroom", "roomNumber").populate("entries.faculty", "name");
    res.status(200).json({ timetables });
  } catch (error) {
    console.error("Error fetching timetables:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add this new controller function
const getTimetableNames = async (req, res) => {
  try {
    const timetables = await Timetable.find({}, 'title'); // Only fetch titles
    const names = timetables.map(t => t.title);
    res.status(200).json(names);
  } catch (error) {
    console.error("Error fetching timetable names:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getTimetableByTitle = async (req, res) => {
  const { title } = req.params;
  console.log("Request for timetable with title:", title); // Log the title to verify
  try {
    const timetable = await Timetable.findOne({ title }).populate("entries.module", "title").populate("entries.classroom", "roomNumber").populate("entries.faculty", "name");

    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found." });
    }

    res.status(200).json({ timetable });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new entry to existing timetable
const addTimetableEntry = async (req, res) => {
  const { title } = req.params;
  const { module, classroom, faculty, timeSlot } = req.body;

  try {
    // First check for classroom conflicts
    const conflict = await Timetable.findOne({
      "entries.classroom": classroom,
      "entries.timeSlot": timeSlot
    });

    if (conflict) {
      return res.status(400).json({ 
        message: "Classroom is already booked at this time in another timetable" 
      });
    }

    // Add the new entry
    const updatedTimetable = await Timetable.findOneAndUpdate(
      { title },
      { 
        $push: { 
          entries: { module, classroom, faculty, timeSlot }
        } 
      },
      { new: true }
    ).populate("entries.module", "title")
     .populate("entries.classroom", "roomNumber")
     .populate("entries.faculty", "name");

    if (!updatedTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.status(200).json({ 
      message: "Entry added successfully",
      timetable: updatedTimetable
    });
  } catch (error) {
    console.error("Error adding timetable entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing timetable entry
const updateTimetableEntry = async (req, res) => {
  const { title, entryId } = req.params;
  const { module, classroom, faculty, timeSlot } = req.body;

  try {
    // First check for classroom conflicts
    const conflict = await Timetable.findOne({
      title: { $ne: title }, // Exclude current timetable
      "entries.classroom": classroom,
      "entries.timeSlot": timeSlot
    });

    if (conflict) {
      return res.status(400).json({ 
        message: "Classroom is already booked at this time in another timetable" 
      });
    }

    // Update the entry
    const updatedTimetable = await Timetable.findOneAndUpdate(
      { title, "entries._id": entryId },
      { 
        $set: { 
          "entries.$.module": module,
          "entries.$.classroom": classroom,
          "entries.$.faculty": faculty,
          "entries.$.timeSlot": timeSlot
        } 
      },
      { new: true }
    ).populate("entries.module", "title")
     .populate("entries.classroom", "roomNumber")
     .populate("entries.faculty", "name");

    if (!updatedTimetable) {
      return res.status(404).json({ message: "Timetable or entry not found" });
    }

    res.status(200).json({ 
      message: "Entry updated successfully",
      timetable: updatedTimetable
    });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a timetable entry
const deleteTimetableEntry = async (req, res) => {
  const { title, entryId } = req.params;

  try {
    const updatedTimetable = await Timetable.findOneAndUpdate(
      { title },
      { $pull: { entries: { _id: entryId } } },
      { new: true }
    ).populate("entries.module", "title")
     .populate("entries.classroom", "roomNumber")
     .populate("entries.faculty", "name");

    if (!updatedTimetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.status(200).json({ 
      message: "Entry deleted successfully",
      timetable: updatedTimetable
    });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { generateTimetable, getTimetables, getTimetableByTitle, getTimetableNames, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry };
