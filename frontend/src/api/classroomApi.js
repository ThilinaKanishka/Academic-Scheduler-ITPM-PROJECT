import axios from "axios";

const API_URL = "http://localhost:5000/api/classrooms";

export const getClassrooms = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addClassroom = async (classroom) => {
  const response = await axios.post(API_URL, classroom);
  return response.data;
};

export const updateClassroom = async (id, classroom) => {
  const response = await axios.put(`${API_URL}/${id}`, classroom);
  return response.data;
};

export const deleteClassroom = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};
