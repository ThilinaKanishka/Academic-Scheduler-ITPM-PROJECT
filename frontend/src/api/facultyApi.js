import API from "./axiosConfig";

export const getFaculty = async () => {
  try {
    const response = await API.get("/faculty");
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty:", error);
    throw error;
  }
};

export const addFaculty = async (faculty) => {
  try {
    const response = await API.post("/faculty", faculty);
    return response.data;
  } catch (error) {
    console.error("Error adding faculty:", error);
    throw error;
  }
};

export const updateFaculty = async (id, faculty) => {
  try {
    const response = await API.put(`/faculty/${id}`, faculty);
    return response.data;
  } catch (error) {
    console.error("Error updating faculty:", error);
    throw error;
  }
};

export const deleteFaculty = async (id) => {
  try {
    await API.delete(`/faculty/${id}`);
    return { message: "Faculty deleted successfully" };
  } catch (error) {
    console.error("Error deleting faculty:", error);
    throw error;
  }
};
