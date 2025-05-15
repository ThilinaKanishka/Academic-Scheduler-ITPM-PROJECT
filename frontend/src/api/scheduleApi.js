import API from "./axiosConfig";

// Generate timetable based on selected modules
export const generateTimetable = async (selectedModules) => {
  try {
    const response = await API.post("/schedules/generate", { modules: selectedModules });
    return response.data;
  } catch (error) {
    console.error("Error generating timetable:", error);
    throw error;
  }
};
