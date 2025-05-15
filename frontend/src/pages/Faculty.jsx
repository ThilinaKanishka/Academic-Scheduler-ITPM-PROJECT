import { useEffect, useState } from "react";
import { getFaculty, addFaculty, updateFaculty, deleteFaculty } from "../api/facultyApi";
import Swal from 'sweetalert2';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
  });
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const data = await getFaculty();
      setFaculty(data);
    } catch (error) {
      console.error("Error loading faculty:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load faculty data',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty({ ...newFaculty, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await updateFaculty(editingFaculty._id, newFaculty);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Faculty updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await addFaculty(newFaculty);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Faculty added successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setNewFaculty({ name: "", email: "", department: "", designation: "" });
      setEditingFaculty(null);
      fetchFaculty();
    } catch (error) {
      console.error("Error saving faculty:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error saving the faculty.',
      });
    }
  };

  const handleEdit = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setNewFaculty({
      name: facultyMember.name,
      email: facultyMember.email,
      department: facultyMember.department,
      designation: facultyMember.designation,
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
        await deleteFaculty(id);
        fetchFaculty();
        Swal.fire(
          'Deleted!',
          'Faculty member has been deleted.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting faculty:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error deleting faculty member.',
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">{editingFaculty ? "Edit Faculty Members" : "Manage Faculty Members"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={newFaculty.name}
          onChange={handleInputChange}
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          value={newFaculty.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="department"
          value={newFaculty.department}
          onChange={handleInputChange}
          placeholder="Department"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="designation"
          value={newFaculty.designation}
          onChange={handleInputChange}
          placeholder="Designation (e.g. Professor, Lecturer)"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
        >
          {editingFaculty ? "Update Faculty" : "Create Faculty"}
        </button>
      </form>
      <h3 className="text-xl font-semibold mt-8 mb-4">Faculty Members List</h3>
      <div className="space-y-4">
        {faculty.map((member) => (
          <div key={member._id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{member.name}</h3>
              <p className="text-gray-600">{member.designation}</p>
              <p><strong>Department:</strong> {member.department}</p>
              <p><strong>Email:</strong> {member.email}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(member)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(member._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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

export default Faculty;