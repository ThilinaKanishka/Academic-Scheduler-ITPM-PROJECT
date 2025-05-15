import API from "./axiosConfig";

const BASE_URL = "/exams";

export const getExamSchedules = async () => {
  const response = await API.get(BASE_URL);
  return response.data;
};

export const getExamScheduleById = async (id) => {
  const response = await API.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createExamSchedule = async (examData) => {
  const response = await API.post(BASE_URL, examData);
  return response.data;
};

export const updateExamSchedule = async (id, examData) => {
  const response = await API.put(`${BASE_URL}/${id}`, examData);
  return response.data;
};

export const deleteExamSchedule = async (id) => {
  await API.delete(`${BASE_URL}/${id}`);
};

export const getAvailableClassrooms = async (dateTime) => {
  const response = await API.get(`${BASE_URL}/available-classrooms`, {
    params: { dateTime }
  });
  return response.data;
};