import { useState, useEffect } from "react";
import {
  getClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
} from "../api/classroomApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheck,
  FiMonitor,
  FiSliders,
  FiType,
  FiMaximize2,
  FiMinimize2,
  FiCamera,
  FiVolume2,
  FiFileText,
  FiGrid,
} from "react-icons/fi";

const MySwal = withReactContent(Swal);

const CLASSROOM_TYPES = ["Lecture Hall", "Lab"];
const TOOL_OPTIONS = [
  { name: "Smart Board", icon: <FiMonitor className="inline mr-1" /> },
  { name: "Document Camera", icon: <FiCamera className="inline mr-1" /> },
  { name: "Sound System", icon: <FiVolume2 className="inline mr-1" /> },
  { name: "Whiteboard", icon: <FiFileText className="inline mr-1" /> },
  { name: "Blackboard", icon: <FiGrid className="inline mr-1" /> },
];
const INITIAL_CLASSROOM_STATE = {
  roomNumber: "",
  capacity: "",
  classroomType: "Lecture Hall",
  hasProjector: false,
  additionalTools: [],
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [formData, setFormData] = useState(INITIAL_CLASSROOM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    classroomType: "all",
    hasProjector: "all",
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    filterClassrooms();
  }, [classrooms, searchTerm, filters]);

  const fetchClassrooms = async () => {
    try {
      setIsLoading(true);
      const data = await getClassrooms();
      setClassrooms(data);
    } catch (err) {
      showErrorAlert("Failed to fetch classrooms");
    } finally {
      setIsLoading(false);
    }
  };

  const filterClassrooms = () => {
    let results = [...classrooms];

    if (searchTerm) {
      results = results.filter((classroom) =>
        classroom.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.classroomType !== "all") {
      results = results.filter(
        (classroom) => classroom.classroomType === filters.classroomType
      );
    }

    if (filters.hasProjector !== "all") {
      const projectorFilter = filters.hasProjector === "yes";
      results = results.filter(
        (classroom) => classroom.hasProjector === projectorFilter
      );
    }

    setFilteredClassrooms(results);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToolChange = (tool, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      additionalTools: isChecked
        ? [...prev.additionalTools, tool]
        : prev.additionalTools.filter((t) => t !== tool),
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.roomNumber.trim()) {
      showErrorAlert("Room number is required");
      return false;
    }

    if (!formData.capacity) {
      showErrorAlert("Capacity is required");
      return false;
    }

    if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      showErrorAlert("Capacity must be a positive number");
      return false;
    }

    if (
      !editingId &&
      classrooms.some((c) => c.roomNumber === formData.roomNumber.trim())
    ) {
      showErrorAlert("Room number already exists");
      return false;
    }

    if (
      editingId &&
      classrooms.some(
        (c) =>
          c.roomNumber === formData.roomNumber.trim() && c._id !== editingId
      )
    ) {
      showErrorAlert("Room number already exists");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (editingId) {
        await updateClassroom(editingId, formData);
        showSuccessAlert("Classroom updated successfully");
        setShowEditModal(false);
      } else {
        await addClassroom(formData);
        showSuccessAlert("Classroom added successfully");
      }
      resetForm();
      await fetchClassrooms();
    } catch (error) {
      showErrorAlert(error.message || "Failed to save classroom");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_CLASSROOM_STATE);
    setEditingId(null);
  };

  const handleEdit = (classroom) => {
    setEditingId(classroom._id);
    setFormData({
      roomNumber: classroom.roomNumber,
      capacity: classroom.capacity,
      classroomType: classroom.classroomType,
      hasProjector: classroom.hasProjector,
      additionalTools: classroom.additionalTools || [],
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      background: "#1e293b",
      color: "#f8fafc",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await deleteClassroom(id);
      setClassrooms(classrooms.filter((c) => c._id !== id));
      showSuccessAlert("Classroom deleted successfully");
    } catch (error) {
      showErrorAlert("Failed to delete classroom");
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessAlert = (message) => {
    MySwal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonColor: "#6366f1",
      background: "#1e293b",
      color: "#f8fafc",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const showErrorAlert = (message) => {
    MySwal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonColor: "#6366f1",
      background: "#1e293b",
      color: "#f8fafc",
    });
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getToolIcon = (toolName) => {
    const tool = TOOL_OPTIONS.find((t) => t.name === toolName);
    return tool ? tool.icon : null;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-indigo-600 mb-6 flex items-center"
      >
        <FiSliders className="mr-2" /> Classroom Management
      </motion.h1>

      {/* Add New Classroom Form Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100"
      >
        <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
          <FiPlus className="mr-2" /> Add New Classroom
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={fadeIn}>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Room Number*
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                placeholder="E.g., A101"
              />
            </motion.div>

            <motion.div variants={fadeIn}>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Capacity*
              </label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                placeholder="E.g., 30"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={fadeIn}>
              <label className="block text-sm font-medium text-indigo-700 mb-1">
                Classroom Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                  <FiType />
                </div>
                <select
                  name="classroomType"
                  value={formData.classroomType}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none transition-all duration-200"
                >
                  {CLASSROOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center pt-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="hasProjector"
                  name="hasProjector"
                  checked={formData.hasProjector}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-indigo-700">
                  Equipped with projector
                </span>
              </label>
            </motion.div>
          </div>

          {/* Additional Tools Section */}
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-indigo-700 mb-2">
              Additional Tools
            </label>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
              variants={stagger}
            >
              {TOOL_OPTIONS.map((tool) => (
                <motion.div
                  key={tool.name}
                  variants={fadeIn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`tool-${tool.name}`}
                    checked={formData.additionalTools.includes(tool.name)}
                    onChange={(e) =>
                      handleToolChange(tool.name, e.target.checked)
                    }
                    className="hidden peer"
                  />
                  <label
                    htmlFor={`tool-${tool.name}`}
                    className={`inline-flex items-center justify-between w-full p-2 text-indigo-700 border-2 border-indigo-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:bg-indigo-50 transition-colors duration-200`}
                  >
                    <div className="flex items-center">
                      {tool.icon}
                      <div className="ml-2 text-sm font-medium">
                        {tool.name}
                      </div>
                    </div>
                    {formData.additionalTools.includes(tool.name) ? (
                      <FiCheck className="text-indigo-600" />
                    ) : null}
                  </label>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="flex space-x-3 pt-2" variants={fadeIn}>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              } transition-all duration-200 flex items-center shadow-md hover:shadow-lg`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" /> Add Classroom
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>

      {/* Edit Classroom Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                    <FiEdit2 className="mr-2" /> Edit Classroom
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Room Number*
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                        placeholder="E.g., A101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Capacity*
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                        placeholder="E.g., 30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Classroom Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                          <FiType />
                        </div>
                        <select
                          name="classroomType"
                          value={formData.classroomType}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none transition-all duration-200"
                        >
                          {CLASSROOM_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="hasProjector"
                          name="hasProjector"
                          checked={formData.hasProjector}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-indigo-700">
                          Equipped with projector
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      Additional Tools
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TOOL_OPTIONS.map((tool) => (
                        <div key={tool.name} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`edit-tool-${tool.name}`}
                            checked={formData.additionalTools.includes(
                              tool.name
                            )}
                            onChange={(e) =>
                              handleToolChange(tool.name, e.target.checked)
                            }
                            className="hidden peer"
                          />
                          <label
                            htmlFor={`edit-tool-${tool.name}`}
                            className={`inline-flex items-center justify-between w-full p-2 text-indigo-700 border-2 border-indigo-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:bg-indigo-50 transition-colors duration-200`}
                          >
                            <div className="flex items-center">
                              {tool.icon}
                              <div className="ml-2 text-sm font-medium">
                                {tool.name}
                              </div>
                            </div>
                            {formData.additionalTools.includes(tool.name) ? (
                              <FiCheck className="text-indigo-600" />
                            ) : null}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-6 py-2 rounded-lg text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      } transition-all duration-200 flex items-center shadow-md hover:shadow-lg`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2" /> Update Classroom
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100"
      >
        <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
          <FiSearch className="mr-2" /> Search & Filter
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Search by Room Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                <FiSearch />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
                placeholder="Search rooms..."
              />
            </div>
          </motion.div>

          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Filter by Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                <FiType />
              </div>
              <select
                name="classroomType"
                value={filters.classroomType}
                onChange={handleFilterChange}
                className="pl-10 w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none transition-all duration-200"
              >
                <option value="all">All Types</option>
                {CLASSROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Filter by Projector
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                <FiMonitor />
              </div>
              <select
                name="hasProjector"
                value={filters.hasProjector}
                onChange={handleFilterChange}
                className="pl-10 w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none transition-all duration-200"
              >
                <option value="all">All</option>
                <option value="yes">With Projector</option>
                <option value="no">Without Projector</option>
              </select>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Classroom List Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      >
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-600 to-blue-600">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FiGrid className="mr-2" /> Classroom List
          </h2>
          <div className="text-sm text-indigo-100 bg-indigo-800 bg-opacity-30 px-3 py-1 rounded-full">
            Showing {filteredClassrooms.length} of {classrooms.length}{" "}
            classrooms
          </div>
        </div>

        {isLoading && !classrooms.length ? (
          <div className="p-6 text-center text-gray-500 flex justify-center items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading classrooms...
          </div>
        ) : filteredClassrooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 text-center text-gray-500"
          >
            No classrooms found matching your criteria
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Projector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Tools
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredClassrooms.map((classroom) => (
                    <motion.tr
                      key={classroom._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`hover:bg-indigo-50 transition-colors duration-200 ${
                        expandedRow === classroom._id ? "bg-indigo-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpandRow(classroom._id)}
                            className="mr-2 text-indigo-500 hover:text-indigo-700"
                          >
                            {expandedRow === classroom._id ? (
                              <FiMinimize2 />
                            ) : (
                              <FiMaximize2 />
                            )}
                          </button>
                          <div className="text-sm font-medium text-indigo-900">
                            {classroom.roomNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-indigo-700">
                          {classroom.capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-indigo-700">
                          {classroom.classroomType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            classroom.hasProjector
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {classroom.hasProjector ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {classroom.additionalTools?.length > 0 ? (
                            classroom.additionalTools.map((tool) => (
                              <span
                                key={tool}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {getToolIcon(tool)}
                                {tool}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(classroom)}
                          className="text-amber-600 hover:text-amber-800 mr-4 hover:underline flex items-center"
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(classroom._id)}
                          className="text-red-600 hover:text-red-800 hover:underline flex items-center"
                        >
                          <FiTrash2 className="mr-1" /> Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
