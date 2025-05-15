import { useEffect, useState } from "react";
import { 
  getModules, 
  addModule, 
  updateModule, 
  deleteModule,
  uploadModulePdf,
  deleteModulePdf 
} from "../api/moduleApi";
import { getFaculty } from "../api/facultyApi";
import { getCourses } from "../api/courseApi";
import Swal from "sweetalert2";

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    course: "",
    faculty: "",
  });
  const [editModule, setEditModule] = useState(null);
  const [pdfData, setPdfData] = useState({
    title: "",
    file: null
  });
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [filters, setFilters] = useState({
    course: "",
    faculty: ""
  });

  useEffect(() => {
    fetchModules();
    fetchFaculty();
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [modules, filters]);

  const fetchModules = async () => {
    try {
      const data = await getModules();
      setModules(data);
    } catch (error) {
      console.error("Error loading modules:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load modules. Please try again.',
      });
    }
  };

  const applyFilters = () => {
    let result = [...modules];
    
    if (filters.course) {
      result = result.filter(module => module.course?._id === filters.course);
    }
    
    if (filters.faculty) {
      result = result.filter(module => module.faculty?._id === filters.faculty);
    }
    
    setFilteredModules(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      course: "",
      faculty: ""
    });
  };

  const fetchFaculty = async () => {
    try {
      const data = await getFaculty();
      setFaculty(data);
    } catch (error) {
      console.error("Error loading faculty:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load faculty. Please try again.',
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load courses. Please try again.',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editModule) {
      setEditModule({ ...editModule, [name]: value });
    } else {
      setNewModule({ ...newModule, [name]: value });
    }
  };

  const handlePdfChange = (e) => {
    setPdfData({
      ...pdfData,
      [e.target.name]: e.target.name === 'file' ? e.target.files[0] : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editModule) {
        await updateModule(editModule._id, editModule);
        setEditModule(null);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Module updated successfully!',
        });
      } else {
        await addModule(newModule);
        setNewModule({ title: "", description: "", course: "", faculty: "" });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Module created successfully!',
        });
      }
      fetchModules();
    } catch (error) {
      console.error("Error saving module:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save module. Please try again.',
      });
    }
  };

  const handleEditClick = (module) => {
    setEditModule({
      ...module,
      course: module.course?._id || "", 
      faculty: module.faculty?._id || ""
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteModule(id);
        await Swal.fire(
          'Deleted!',
          'Module has been deleted.',
          'success'
        );
        fetchModules();
      } catch (error) {
        console.error("Error deleting module:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete module. Please try again.',
        });
      }
    }
  };

  const handlePdfUpload = async (moduleId) => {
    if (!pdfData.file || !pdfData.title) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please provide both a title and select a PDF file',
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", pdfData.title);
    formData.append("pdf", pdfData.file);

    try {
      await uploadModulePdf(moduleId, formData);
      fetchModules();
      setPdfData({ title: "", file: null });
      setActiveModuleId(null);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'PDF uploaded successfully!',
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to upload PDF. Please try again.',
      });
    }
  };

  const handlePdfDelete = async (moduleId, pdfId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteModulePdf(moduleId, pdfId);
        await Swal.fire(
          'Deleted!',
          'PDF has been deleted.',
          'success'
        );
        fetchModules();
      } catch (error) {
        console.error("Error deleting PDF:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete PDF. Please try again.',
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Manage Modules</h2>
      
      {/* Module Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 gap-4">
          <input 
            type="text" 
            name="title" 
            value={editModule ? editModule.title : newModule.title} 
            onChange={handleInputChange} 
            placeholder="Module Title" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          />
          
          <textarea 
            name="description" 
            value={editModule ? editModule.description : newModule.description} 
            onChange={handleInputChange} 
            placeholder="Module Description" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" 
            rows={5}
          />
          
          <select 
            name="course" 
            value={editModule ? editModule.course : newModule.course} 
            onChange={handleInputChange} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          
          <select 
            name="faculty" 
            value={editModule ? editModule.faculty : newModule.faculty} 
            onChange={handleInputChange} 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Faculty</option>
            {faculty.map((member) => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            {editModule ? "Update Module" : "Create Module"}
          </button>
        </div>
      </form>

      {/* Filter Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Filter Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="course"
            value={filters.course}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          
          <select
            name="faculty"
            value={filters.faculty}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Faculty</option>
            {faculty.map((member) => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
          
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">
        {filters.course || filters.faculty ? "Filtered Modules" : "All Modules"} 
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({filteredModules.length} modules found)
        </span>
      </h3>
      
      <div className="space-y-4">
        {filteredModules.length > 0 ? (
          filteredModules.map((mod) => (
            <div key={mod._id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-bold">{mod.title}</h3>
              <p className="text-gray-600 whitespace-pre-line">{mod.description}</p>
              <p><strong>Course:</strong> {mod.course?.name || "No course assigned"}</p>
              <p><strong>Faculty:</strong> {mod.faculty?.name || "No faculty assigned"}</p>

              {/* PDF Upload Section */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <button 
                  onClick={() => setActiveModuleId(activeModuleId === mod._id ? null : mod._id)}
                  className="text-blue-500 hover:text-blue-700 mb-2 transition"
                >
                  {activeModuleId === mod._id ? "Cancel Upload" : "Add PDF Material"}
                </button>

                {activeModuleId === mod._id && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      name="title"
                      value={pdfData.title}
                      onChange={handlePdfChange}
                      placeholder="PDF Title"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="file"
                      name="file"
                      accept=".pdf"
                      onChange={handlePdfChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      onClick={() => handlePdfUpload(mod._id)}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                      Upload PDF
                    </button>
                  </div>
                )}
              </div>

              {/* PDF List */}
              {mod.pdfs?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">PDF Materials</h4>
                  <ul className="space-y-2">
                    {mod.pdfs.map((pdf) => (
                      <li key={pdf._id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <div>
                          <span className="font-medium">{pdf.title}</span>
                          <a 
                            href={`http://localhost:5000/uploads/${pdf.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:underline text-sm"
                          >
                            (View PDF)
                          </a>
                        </div>
                        <button
                          onClick={() => handlePdfDelete(mod._id, pdf._id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleEditClick(mod)} 
                  className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(mod._id)} 
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {modules.length === 0 ? (
              "No modules available. Create your first module!"
            ) : (
              "No modules match your filters. Try different criteria."
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modules;