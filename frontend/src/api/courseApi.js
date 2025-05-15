import API from "./axiosConfig";

export const getCourses = async () => {
  try {
    const response = await API.get("/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await API.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};

export const addCourse = async (course) => {
  try {
    const response = await API.post("/courses", course);
    return response.data;
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};


export const updateCourse = async (id, course) => {
  try {
    const response = await API.put(`/courses/${id}`, course);
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    await API.delete(`/courses/${id}`);
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};
