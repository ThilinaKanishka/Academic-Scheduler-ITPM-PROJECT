import React, { useState, useEffect } from "react";
import { getModules } from "../api/moduleApi";
import { getClassrooms } from "../api/classroomApi";
import { getFaculty } from "../api/facultyApi";
import { generateTimetable } from "../api/timetableApi";
import Swal from 'sweetalert2';

const TimetableGenerator = () => {
  const [timetableTitle, setTimetableTitle] = useState(""); // New state for title
  const [modules, setModules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesData = await getModules();
        const classroomsData = await getClassrooms();
        const facultyData = await getFaculty();
        setModules(modulesData);
        setClassrooms(classroomsData);
        setFaculty(facultyData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch data. Please try again later.',
        });
      }
    };
    fetchData();
  }, []);

  const handleAddEntry = () => {
    if (selectedModule && selectedClassroom && selectedFaculty) {
      const newEntry = {
        module: selectedModule,
        classroom: selectedClassroom,
        faculty: selectedFaculty,
      };
      setEntries([...entries, newEntry]);
      setSelectedModule("");
      setSelectedClassroom("");
      setSelectedFaculty("");
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Entry added successfully',
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select a module, classroom, and faculty.',
      });
    }
  };

  const handleGenerateTimetable = async () => {
    if (!timetableTitle.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Title',
        text: 'Please enter a timetable title.',
      });
      return;
    }
  
    if (entries.length < 4) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Enough Entries',
        text: 'Please add at least 4 entries to generate a timetable.',
      });
      return;
    }
  
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You're about to generate a new timetable.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, generate it!'
      });
      
      if (result.isConfirmed) {
        const response = await generateTimetable(timetableTitle, entries);
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Timetable generated successfully!',
          footer: `<a href="/timetables/${response.timetable._id}">View Timetable</a>`
        });
        
        console.log("Generated Timetable:", response.timetable);
      }
    } catch (error) {
      console.error("Error generating timetable:", error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: error.response?.data?.message || 'Failed to generate timetable. Please try again.',
      });
    }
  };
  

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Timetable Generator</h1>

      {/* Timetable Title Input */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Timetable Title:</label>
        <input
          type="text"
          value={timetableTitle}
          onChange={(e) => setTimetableTitle(e.target.value)}
          placeholder="Enter timetable name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Entry</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Module:</label>
          <select 
            value={selectedModule} 
            onChange={(e) => setSelectedModule(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium mb-2">Classroom:</label>
          <select 
            value={selectedClassroom} 
            onChange={(e) => setSelectedClassroom(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.roomNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Faculty:</label>
          <select 
            value={selectedFaculty} 
            onChange={(e) => setSelectedFaculty(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Faculty Member</option>
            {faculty.map((fac) => (
              <option key={fac._id} value={fac._id}>
                {fac.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleAddEntry}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Add Entry
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Entries</h2>
        <ul className="space-y-2">
          {entries.map((entry, index) => {
            const module = modules.find((m) => m._id === entry.module);
            const classroom = classrooms.find((c) => c._id === entry.classroom);
            const fac = faculty.find((f) => f._id === entry.faculty);
            return (
              <li key={index} className="border-b pb-2">
                <strong>Module:</strong> {module?.title}, <strong>Classroom:</strong> {classroom?.roomNumber},{" "}
                <strong>Faculty:</strong> {fac?.name}
              </li>
            );
          })}
        </ul>
      </div>

      <button 
        onClick={handleGenerateTimetable}
        disabled={entries.length < 4}
        className={`w-full py-3 px-4 rounded-md text-white ${entries.length < 4 ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} transition duration-200`}
      >
        Generate Timetable
      </button>
    </div>
  );
};

export default TimetableGenerator;