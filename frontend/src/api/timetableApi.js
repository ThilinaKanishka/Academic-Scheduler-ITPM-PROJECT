import API from "./axiosConfig";

export const generateTimetable = async (title, entries) => {
  try {
    const response = await API.post("/timetable/generate", { title, entries });
    return response.data;
  } catch (error) {
    console.error("Error generating timetable:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchTimetableByName = async (name) => {
  try {
    const response = await API.get(`/timetable/${name}`);
    return response.data.timetable;
  } catch (error) {
    console.error("Error fetching timetable:", error);
    throw error;
  }
};

export const fetchAllTimetableNames = async () => {
  try {
    const response = await API.get("/timetable/names");
    return response.data;
  } catch (error) {
    console.error("Error fetching timetable names:", error);
    throw error;
  }
};

export const addTimetableEntry = async (title, newEntry) => {
  try {
    const response = await API.post(`/timetable/${title}/entries`, newEntry);
    return response.data;
  } catch (error) {
    console.error("Error adding timetable entry:", error.response?.data || error.message);
    throw error;
  }
};

export const updateTimetableEntry = async (title, entryId, updatedEntry) => {
  try {
    const response = await API.put(`/timetable/${title}/entries/${entryId}`, updatedEntry);
    return response.data;
  } catch (error) {
    console.error("Error updating timetable entry:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteTimetableEntry = async (title, entryId) => {
  try {
    const response = await API.delete(`/timetable/${title}/entries/${entryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    throw error;
  }
};