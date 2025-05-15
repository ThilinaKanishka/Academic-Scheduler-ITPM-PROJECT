// moduleRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Configure as needed
const { 
    getAllModules, 
    getModuleById,       // ✅ Add this
    createModule, 
    updateModule, 
    deleteModule,
    uploadPdf,
    deletePdf
  } = require("../controllers/moduleController");
  
  router.get("/", getAllModules);
  router.get("/:id", getModuleById);
  router.post("/", createModule);
  router.put("/:id", updateModule);
  router.delete("/:id", deleteModule);
  router.post("/:id/pdfs", upload.single("pdf"), uploadPdf);
  router.delete("/:moduleId/pdfs/:pdfId", deletePdf);
  
  

module.exports = router;