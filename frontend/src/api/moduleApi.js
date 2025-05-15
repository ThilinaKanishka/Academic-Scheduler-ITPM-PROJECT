import API from "./axiosConfig";

export const getModules = async () => {
  try {
    const response = await API.get("/modules");
    return response.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};

export const getModuleById = async (id) => {
  try {
    const response = await API.get(`/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module details:", error);
    throw error;
  }
};


export const addModule = async (module) => {
  try {
    const response = await API.post("/modules", module);
    return response.data;
  } catch (error) {
    console.error("Error adding module:", error);
    throw error;
  }
};

export const updateModule = async (id, moduleData) => {
  try {
    const response = await API.put(`/modules/${id}`, moduleData);
    return response.data;
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

export const deleteModule = async (id) => {
  try {
    await API.delete(`/modules/${id}`);
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};

// PDF-related API functions
export const uploadModulePdf = async (moduleId, formData) => {
  try {
    const response = await API.post(
      `/modules/${moduleId}/pdfs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

export const deleteModulePdf = async (moduleId, pdfId) => {
  try {
    await API.delete(`/modules/${moduleId}/pdfs/${pdfId}`);
  } catch (error) {
    console.error("Error deleting PDF:", error);
    throw error;
  }
};

// Function to download PDF (if needed)
export const downloadPdf = async (filePath) => {
  try {
    const response = await API.get(`/uploads/${filePath}`, {
      responseType: "blob", // Important for file downloads
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

// Fetch all modules with minimal info (title and description)
export const getModulesForUser = async () => {
  try {
    const response = await API.get("/modules");
    // You can optionally filter out only title and description here
    return response.data.map(({ _id, title, description }) => ({
      _id,
      title,
      description
    }));
  } catch (error) {
    console.error("Error fetching modules for user:", error);
    throw error;
  }
};

// Fetch detailed info about a single module by ID when clicked
export const getModuleDetails = async (moduleId) => {
  try {
    const response = await API.get(`/modules/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module details:", error);
    throw error;
  }
};

