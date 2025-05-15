import { useEffect, useState } from "react";
import { getModules } from "../api/moduleApi";
import { getFaculty } from "../api/facultyApi";
import { getCourses } from "../api/courseApi";

const UserModulesView = () => {
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facultyData, courseData, moduleData] = await Promise.all([
        getFaculty(),
        getCourses(),
        getModules()
      ]);
      setFaculties(facultyData);
      setCourses(courseData);
      setModules(moduleData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
    setSelectedModule(null);
  };

  const getModulesByCourse = (courseId) => {
    return modules.filter(module => module.course?._id === courseId);
  };

  // Get courses that have at least one module
  const getCoursesWithModules = () => {
    return courses.filter(course => 
      modules.some(module => module.course?._id === course._id)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Learning Materials</h1>
      
      {/* Course List */}
      <div className="space-y-4">
        {getCoursesWithModules().length > 0 ? (
          getCoursesWithModules().map(course => (
            <div key={course._id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCourse(course._id)}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
              >
                <h2 className="text-xl font-semibold">{course.name}</h2>
                <svg
                  className={`w-5 h-5 transform transition-transform ${expandedCourse === course._id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Modules under Course */}
              {expandedCourse === course._id && (
                <div className="bg-white p-4 pl-8 space-y-3">
                  {getModulesByCourse(course._id).length > 0 ? (
                    getModulesByCourse(course._id).map(module => (
                      <div 
                        key={module._id} 
                        onClick={() => setSelectedModule(module)}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <h4 className="font-medium text-blue-600">{module.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        {module.pdfs?.length > 0 && (
                          <span className="inline-block mt-2 text-xs text-gray-500">
                            {module.pdfs.length} material{module.pdfs.length !== 1 ? 's' : ''} available
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-gray-500">No materials available for this course</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">No courses with materials available</p>
        )}
      </div>

      {/* Module Details Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                  <p className="text-gray-600 mt-2">{selectedModule.description}</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p><span className="font-medium">Course:</span> {selectedModule.course?.name || "Not specified"}</p>
                    <p><span className="font-medium">Faculty:</span> {selectedModule.faculty?.name || "Not specified"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* PDF Materials */}
              {selectedModule.pdfs?.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Learning Materials</h3>
                  <ul className="space-y-3">
                    {selectedModule.pdfs.map(pdf => (
                      <li key={pdf._id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                        <div className="bg-red-100 p-2 rounded-full mr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{pdf.title}</h4>
                          <a
                            href={`http://localhost:5000/uploads/${pdf.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1 text-blue-500 hover:underline text-sm"
                          >
                            Download PDF
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No learning materials available for this module</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModulesView;