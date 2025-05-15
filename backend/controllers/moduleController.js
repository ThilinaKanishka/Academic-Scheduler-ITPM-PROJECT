const Module = require("../models/Module");
const fs = require('fs');
const path = require('path');

// @desc Get all modules with faculty populated
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find()
      .populate("faculty", "name")  // Populate the faculty field with the faculty's name
      .populate("course", "name description");  // Optionally populate course details too

    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Get single module by ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate("faculty", "name")
      .populate("course", "name description");

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Create new module
exports.createModule = async (req, res) => {
  try {
    const { title, description, course, faculty } = req.body;  // Include faculty in the request
    const module = new Module({ title, description, course, faculty }); // Add faculty reference
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ message: "Error creating module", error });
  }
};

// @desc Update a module by ID
exports.updateModule = async (req, res) => {
  try {
    const { title, description, course, faculty } = req.body;
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      { title, description, course, faculty },
      { new: true, runValidators: true }
    ).populate("faculty", "name").populate("course", "name description");

    if (!updatedModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(400).json({ message: "Error updating module", error });
  }
};


// @desc Delete a module by ID
exports.deleteModule = async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);

    if (!deletedModule) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting module", error });
  }
};



// @desc Upload PDF for a module
exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Get file extension from original name
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Validate it's a PDF
    if (fileExt !== '.pdf') {
      fs.unlinkSync(req.file.path); // Delete the temp file
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Create unique filename with PDF extension
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    // Move the file and ensure it keeps .pdf extension
    fs.renameSync(req.file.path, filePath);

    const module = await Module.findById(req.params.id);
    if (!module) {
      fs.unlinkSync(filePath); // Clean up if module not found
      return res.status(404).json({ message: "Module not found" });
    }

    module.pdfs.push({
      title: req.body.title || path.parse(req.file.originalname).name, // Use filename if no title provided
      filePath: fileName, // Store the complete filename with extension
      originalName: req.file.originalname
    });

    await module.save();
    res.status(200).json(module);
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({ message: "Error uploading PDF", error: error.message });
  }
};

// @desc Delete a PDF from a module
exports.deletePdf = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const pdfIndex = module.pdfs.findIndex(pdf => pdf._id.toString() === req.params.pdfId);
    if (pdfIndex === -1) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // Remove file from filesystem
    const pdfToDelete = module.pdfs[pdfIndex];
    const fullPath = path.join(__dirname, '../uploads', pdfToDelete.filePath);
    
    // Check if file exists before trying to delete
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    } else {
      console.warn(`File not found at path: ${fullPath}`);
    }

    // Remove from array
    module.pdfs.splice(pdfIndex, 1);
    await module.save();

    res.status(200).json(module);
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ 
      message: "Error deleting PDF",
      error: error.message,
      stack: error.stack 
    });
  }
};