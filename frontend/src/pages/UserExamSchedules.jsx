import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getExamSchedules } from "../api/examScheduleApi";

const userExamSchedules = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExamSchedules();
        setExams(data);
        
        // Initialize all courses as expanded
        const courses = data.reduce((acc, exam) => {
          const courseId = exam.course?._id || 'uncategorized';
          acc[courseId] = true;
          return acc;
        }, {});
        
        setExpandedCourses(courses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam schedules:", error);
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Group exams by course and then by module
  const groupedExams = exams.reduce((acc, exam) => {
    const courseId = exam.course?._id || 'uncategorized';
    const courseName = exam.course?.name || 'Uncategorized';
    const moduleId = exam.module?._id || 'no-module';
    const moduleName = exam.module?.title || 'No Module';

    if (!acc[courseId]) {
      acc[courseId] = {
        name: courseName,
        modules: {}
      };
    }

    if (!acc[courseId].modules[moduleId]) {
      acc[courseId].modules[moduleId] = {
        name: moduleName,
        exams: []
      };
    }

    acc[courseId].modules[moduleId].exams.push(exam);
    return acc;
  }, {});

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Schedules</h1>

      <div className="space-y-6">
        {Object.entries(groupedExams).map(([courseId, courseData]) => (
          <div key={courseId} className="bg-white shadow-md rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCourse(courseId)}
              className="w-full px-6 py-4 text-left font-medium text-lg bg-gray-50 hover:bg-gray-100 focus:outline-none"
            >
              <div className="flex justify-between items-center">
                <span>{courseData.name}</span>
                <span className="text-gray-500">
                  {expandedCourses[courseId] ? '−' : '+'}
                </span>
              </div>
            </button>

            {expandedCourses[courseId] && (
              <div className="divide-y divide-gray-200">
                {Object.entries(courseData.modules).map(([moduleId, moduleData]) => (
                  <div key={moduleId} className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      {moduleData.name}
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Faculty
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Classroom
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time Slot
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {moduleData.exams.map((exam) => (
                            <tr key={exam._id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {exam.faculty?.name}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {exam.classroom?.roomNumber} ({exam.classroom?.classroomType})
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(exam.examDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {exam.startTime} - {exam.endTime}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {exam.duration} mins
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default userExamSchedules;