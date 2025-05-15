import { useState, useEffect } from "react";
import { 
  getClassrooms, 
  addClassroom, 
  updateClassroom, 
  deleteClassroom 
} from "../api/classroomApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const CLASSROOM_TYPES = ["Lecture Hall", "Lab"];
const TOOL_OPTIONS = [
  "Smart Board",
  "Document Camera",
  "Sound System",
  "Whiteboard",
  "Blackboard"
];
const INITIAL_CLASSROOM_STATE = {
  roomNumber: "",
  capacity: "",
  classroomType: "Lecture Hall",
  hasProjector: false,
  additionalTools: []
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
    hasProjector: "all"
  });

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
      results = results.filter(classroom => 
        classroom.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.classroomType !== "all") {
      results = results.filter(classroom => 
        classroom.classroomType === filters.classroomType
      );
    }
    
    if (filters.hasProjector !== "all") {
      const projectorFilter = filters.hasProjector === "yes";
      results = results.filter(classroom => 
        classroom.hasProjector === projectorFilter
      );
    }
    
    setFilteredClassrooms(results);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleToolChange = (tool, isChecked) => {
    setFormData(prev => ({
      ...prev,
      additionalTools: isChecked
        ? [...prev.additionalTools, tool]
        : prev.additionalTools.filter(t => t !== tool)
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
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
    
    if (!editingId && classrooms.some(c => c.roomNumber === formData.roomNumber.trim())) {
      showErrorAlert("Room number already exists");
      return false;
    }
    
    if (editingId && classrooms.some(c => 
      c.roomNumber === formData.roomNumber.trim() && c._id !== editingId)) {
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
      additionalTools: classroom.additionalTools || []
    });
    document.getElementById("classroom-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setIsLoading(true);
      await deleteClassroom(id);
      setClassrooms(classrooms.filter(c => c._id !== id));
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
      confirmButtonColor: "#3085d6",
    });
  };

  const showErrorAlert = (message) => {
    MySwal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonColor: "#3085d6",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Classroom Management</h1>
      
      {/* Form Section */}
      <div id="classroom-form" className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? "Edit Classroom" : "Add New Classroom"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number*</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., A101"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity*</label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., 30"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classroom Type</label>
              <select
                name="classroomType"
                value={formData.classroomType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CLASSROOM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="hasProjector"
                name="hasProjector"
                checked={formData.hasProjector}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasProjector" className="ml-2 block text-sm text-gray-700">
                Equipped with projector
              </label>
            </div>
          </div>

          {/* Additional Tools Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Tools</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TOOL_OPTIONS.map(tool => (
                <div key={tool} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tool-${tool}`}
                    checked={formData.additionalTools.includes(tool)}
                    onChange={(e) => handleToolChange(tool, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`tool-${tool}`} className="ml-2 block text-sm text-gray-700">
                    {tool}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md text-white ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} transition-colors duration-200 flex items-center`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : editingId ? 'Update Classroom' : 'Add Classroom'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Search & Filter</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Room Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search rooms..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              name="classroomType"
              value={filters.classroomType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {CLASSROOM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Projector</label>
            <select
              name="hasProjector"
              value={filters.hasProjector}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="yes">With Projector</option>
              <option value="no">Without Projector</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Classroom List Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-700">Classroom List</h2>
          <div className="text-sm text-gray-500">
            Showing {filteredClassrooms.length} of {classrooms.length} classrooms
          </div>
        </div>
        
        {isLoading && !classrooms.length ? (
          <div className="p-6 text-center text-gray-500 flex justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading classrooms...
          </div>
        ) : filteredClassrooms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No classrooms found matching your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Tools</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClassrooms.map(classroom => (
                  <tr key={classroom._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{classroom.roomNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{classroom.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{classroom.classroomType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classroom.hasProjector ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {classroom.hasProjector ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {classroom.additionalTools?.map(tool => (
                          <span key={tool} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {tool}
                          </span>
                        ))}
                        {!classroom.additionalTools?.length && (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(classroom)}
                        className="text-yellow-600 hover:text-yellow-900 mr-4 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(classroom._id)}
                        className="text-red-600 hover:text-red-900 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}