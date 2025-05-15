import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getExamScheduleById,
  createExamSchedule,
  updateExamSchedule,
  getAvailableClassrooms,
} from "../api/examScheduleApi";
import { getModules } from "../api/moduleApi";
import Swal from "sweetalert2";

const ExamScheduleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    module: "",
    course: "",
    faculty: "",
    classroom: "",
    examDate: "",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
  });

  const [modules, setModules] = useState([]);
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesRes = await getModules();
        setModules(modulesRes);

        if (isEdit) {
          const exam = await getExamScheduleById(id);
          setFormData({
            module: exam.module._id,
            course: exam.course._id,
            faculty: exam.faculty._id,
            classroom: exam.classroom._id,
            examDate: new Date(exam.examDate).toISOString().slice(0, 10),
            startTime: exam.startTime,
            endTime: exam.endTime,
            duration: exam.duration,
          });
          // Fetch available classrooms for the existing exam date
          if (exam.examDate) {
            const available = await getAvailableClassrooms(
              new Date(exam.examDate).toISOString(),
              exam.startTime,
              exam.endTime
            );
            setAvailableClassrooms(available);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleModuleChange = (e) => {
    const moduleId = e.target.value;
    const selectedModule = modules.find((module) => module._id === moduleId);

    setFormData({
      ...formData,
      module: moduleId,
      course: selectedModule?.course?._id || "",
      faculty: selectedModule?.faculty?._id || "",
    });
  };

  const handleTimeChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    // Calculate duration if both start and end times are set
    if (name === "startTime" || name === "endTime") {
      if (newFormData.startTime && newFormData.endTime) {
        const [startHours, startMinutes] = newFormData.startTime.split(":").map(Number);
        const [endHours, endMinutes] = newFormData.endTime.split(":").map(Number);
        
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        
        if (endTotal > startTotal) {
          newFormData.duration = endTotal - startTotal;
        }
      }
    }

    setFormData(newFormData);

    // Fetch available classrooms if date is set
    if (newFormData.examDate) {
      try {
        const available = await getAvailableClassrooms(
          newFormData.examDate,
          newFormData.startTime,
          newFormData.endTime
        );
        setAvailableClassrooms(available);
      } catch (error) {
        console.error("Error fetching available classrooms:", error);
        setAvailableClassrooms([]);
      }
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    const newFormData = {
      ...formData,
      examDate: date,
      classroom: "", // Reset classroom selection when date changes
    };

    setFormData(newFormData);

    if (date) {
      try {
        const available = await getAvailableClassrooms(
          date,
          newFormData.startTime,
          newFormData.endTime
        );
        setAvailableClassrooms(available);
      } catch (error) {
        console.error("Error fetching available classrooms:", error);
        setAvailableClassrooms([]);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time
    if (formData.startTime >= formData.endTime) {
      Swal.fire("Error!", "End time must be after start time", "error");
      return;
    }

    try {
      if (isEdit) {
        await updateExamSchedule(id, formData);
        Swal.fire("Updated!", "Exam schedule has been updated.", "success");
      } else {
        await createExamSchedule(formData);
        Swal.fire("Created!", "Exam schedule has been created.", "success");
      }
      navigate("/exams");
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEdit ? "Edit Exam Schedule" : "Add New Exam Schedule"}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <select
                value={formData.module}
                onChange={handleModuleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module._id} value={module._id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <input
                value={
                  modules.find((m) => m._id === formData.module)?.course?.name ||
                  ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty (Invigilator)
              </label>
              <input
                value={
                  modules.find((m) => m._id === formData.module)?.faculty
                    ?.name || ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom
                {formData.examDate && formData.startTime && formData.endTime && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Available for selected time slot)
                  </span>
                )}
              </label>
              <select
                name="classroom"
                value={formData.classroom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.examDate || !formData.startTime || !formData.endTime}
              >
                <option value="">Select Classroom</option>
                {availableClassrooms.length > 0 ? (
                  availableClassrooms.map((classroom) => (
                    <option key={classroom._id} value={classroom._id}>
                      {classroom.roomNumber} ({classroom.classroomType}, Capacity: {classroom.capacity})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {formData.examDate && formData.startTime && formData.endTime
                      ? "No available classrooms for this time slot"
                      : "Select date and time first"}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/exams")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamScheduleForm;