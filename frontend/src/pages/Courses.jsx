import { useEffect, useState } from "react";
import { getCourses, addCourse, updateCourse, deleteCourse } from "../api/courseApi";
import Swal from "sweetalert2";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const handleAddCourse = async () => {
    if (!name) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Course name is required!',
      });
      return;
    }
    try {
      await addCourse({ name, description });
      setName("");
      setDescription("");
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Course added successfully!',
      });
      fetchCourses();
    } catch (error) {
      console.error("Failed to add course:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add course. Please try again.',
      });
    }
  };

  const handleUpdateCourse = async () => {
    if (!name) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Course name is required!',
      });
      return;
    }
    try {
      await updateCourse(editingId, { name, description });
      setEditingId(null);
      setName("");
      setDescription("");
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Course updated successfully!',
      });
      fetchCourses();
    } catch (error) {
      console.error("Failed to update course:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update course. Please try again.',
      });
    }
  };

  const handleDeleteCourse = async (id) => {
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
        await deleteCourse(id);
        await Swal.fire(
          'Deleted!',
          'Course has been deleted.',
          'success'
        );
        fetchCourses();
      } catch (error) {
        console.error("Failed to delete course:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete course. Please try again.',
        });
      }
    }
  };

  const handleEditClick = (course) => {
    setEditingId(course._id);
    setName(course.name);
    setDescription(course.description);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Manage Courses</h2>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Course Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {editingId ? (
            <button
              onClick={handleUpdateCourse}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              Update Course
            </button>
          ) : (
            <button
              onClick={handleAddCourse}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Add Course
            </button>
          )}
        </div>
        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          rows={4}
        />
      </div>
      <h3 className="text-xl font-semibold mb-4">Course List</h3>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course._id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{course.name}</h3>
              <p className="text-gray-600">{course.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(course)}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCourse(course._id)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;