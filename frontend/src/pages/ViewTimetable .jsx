import React, { useState, useEffect } from "react";
import { 
  fetchTimetableByName, 
  fetchAllTimetableNames,
  updateTimetableEntry,
  deleteTimetableEntry,
  addTimetableEntry
} from "../api/timetableApi";
import { getModules } from "../api/moduleApi";
import { getClassrooms } from "../api/classroomApi";
import { getFaculty } from "../api/facultyApi";
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const ViewTimetable = () => {
  const [timetableTitle, setTimetableTitle] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState("");
  const [timetableNames, setTimetableNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [modules, setModules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  
  // Days of the week for dropdown
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Form states
  const [formData, setFormData] = useState({
    module: "",
    classroom: "",
    faculty: "",
    day: "",
    startTime: "09:00 AM",
    endTime: "10:00 AM"
  });
  
  const [newEntry, setNewEntry] = useState({
    module: "",
    classroom: "",
    faculty: "",
    day: "",
    startTime: "09:00 AM",
    endTime: "10:00 AM"
  });

  // Helper functions for time conversion
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '00:00';
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const convertTo12Hour = (timeStr) => {
    if (!timeStr) return '12:00 AM';
    let [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [names, mods, cls, fac] = await Promise.all([
          fetchAllTimetableNames(),
          getModules(),
          getClassrooms(),
          getFaculty()
        ]);
        setTimetableNames(names);
        setModules(mods);
        setClassrooms(cls);
        setFaculty(fac);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch initial data',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Format time slot for display with AM/PM
  const formatTimeSlot = (day, startTime, endTime) => {
    const formatTime = (time) => {
      if (!time) return "00:00 AM";
      
      // Handle case where time might already have AM/PM
      if (typeof time === 'string' && (time.includes('AM') || time.includes('PM'))) {
        return time;
      }
      
      // Handle 24-hour format from TimePicker
      let [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert to 12-hour format
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return `${day} ${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Parse existing time slot for editing
  const parseTimeSlot = (timeSlot) => {
    if (!timeSlot) return { day: "", startTime: "09:00 AM", endTime: "10:00 AM" };
    
    const parts = timeSlot.split(" ");
    const day = parts[0];
    const startTime = `${parts[1]} ${parts[2]}`;
    const endTime = `${parts[4]} ${parts[5]}`;
    
    return { day, startTime, endTime };
  };

  // Handle viewing a timetable
  const handleViewTimetable = async () => {
    if (!timetableTitle) {
      setError("Please select a timetable.");
      return;
    }

    try {
      setIsLoading(true);
      const fetchedTimetable = await fetchTimetableByName(timetableTitle);
      setTimetable(fetchedTimetable);
      setError("");
    } catch (error) {
      setError("Error fetching timetable. Please try again.");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch timetable',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit entry functions
  const handleEditEntry = (entry) => {
    const { day, startTime, endTime } = parseTimeSlot(entry.timeSlot);
    setEditingEntry(entry._id);
    setFormData({
      module: entry.module._id,
      classroom: entry.classroom._id,
      faculty: entry.faculty._id,
      day,
      startTime,
      endTime
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      module: "",
      classroom: "",
      faculty: "",
      day: "",
      startTime: "09:00 AM",
      endTime: "10:00 AM"
    });
  };

  const handleUpdateEntry = async () => {
    try {
      setIsLoading(true);
      const timeSlot = formatTimeSlot(formData.day, formData.startTime, formData.endTime);
      
      const updatedTimetable = await updateTimetableEntry(
        timetableTitle,
        editingEntry,
        {
          module: formData.module,
          classroom: formData.classroom,
          faculty: formData.faculty,
          timeSlot
        }
      );
      
      setTimetable(updatedTimetable.timetable);
      setEditingEntry(null);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Entry updated successfully!',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update entry',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete entry function
  const handleDeleteEntry = async (entryId) => {
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
        setIsLoading(true);
        const updatedTimetable = await deleteTimetableEntry(
          timetableTitle,
          entryId
        );
        setTimetable(updatedTimetable.timetable);
        Swal.fire(
          'Deleted!',
          'The entry has been deleted.',
          'success'
        );
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete entry',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add new entry functions
  const handleAddNewEntry = async () => {
    try {
      setIsLoading(true);
      const timeSlot = formatTimeSlot(newEntry.day, newEntry.startTime, newEntry.endTime);
      
      const updatedTimetable = await addTimetableEntry(
        timetableTitle,
        {
          module: newEntry.module,
          classroom: newEntry.classroom,
          faculty: newEntry.faculty,
          timeSlot
        }
      );
      
      setTimetable(updatedTimetable.timetable);
      setShowAddForm(false);
      setNewEntry({
        module: "",
        classroom: "",
        faculty: "",
        day: "",
        startTime: "09:00 AM",
        endTime: "10:00 AM"
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'New entry added successfully!',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add new entry',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: convertTo12Hour(value)
    }));
  };

  const handleNewTimeChange = (name, value) => {
    setNewEntry(prev => ({
      ...prev,
      [name]: convertTo12Hour(value)
    }));
  };

  // Group entries by day and sort them
  const groupEntriesByDay = (entries) => {
    const grouped = {};
    entries.forEach(entry => {
      const [day, ...timeParts] = entry.timeSlot.split(" ");
      const time = timeParts.join(" ");
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({ ...entry, time });
    });

    // Sort each day's entries by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const toMinutes = (timeRange) => {
          const [time, period] = timeRange.split(" ");
          let [h, m] = time.split(":").map(Number);
          if (period === "PM" && h !== 12) h += 12;
          if (period === "AM" && h === 12) h = 0;
          return h * 60 + m;
        };
        
        const aStart = a.time.split(" - ")[0];
        const bStart = b.time.split(" - ")[0];
        return toMinutes(aStart) - toMinutes(bStart);
      });
    });

    // Define the correct day order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create a new object with days in correct order
    const orderedGrouped = {};
    dayOrder.forEach(day => {
      if (grouped[day]) {
        orderedGrouped[day] = grouped[day];
      }
    });

    return orderedGrouped;
  };

  // Render the add entry form
  const renderAddEntryForm = () => (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3">Add New Entry</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Module:</label>
          <select
            name="module"
            value={newEntry.module}
            onChange={handleNewEntryChange}
            className="w-full px-3 py-2 border rounded"
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
        <div>
          <label className="block text-sm font-medium mb-1">Classroom:</label>
          <select
            name="classroom"
            value={newEntry.classroom}
            onChange={handleNewEntryChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.roomNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Faculty:</label>
          <select
            name="faculty"
            value={newEntry.faculty}
            onChange={handleNewEntryChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Faculty</option>
            {faculty.map((fac) => (
              <option key={fac._id} value={fac._id}>
                {fac.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Day:</label>
          <select
            name="day"
            value={newEntry.day}
            onChange={handleNewEntryChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Day</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Time:</label>
          <TimePicker
            onChange={(value) => handleNewTimeChange('startTime', value)}
            value={convertTo24Hour(newEntry.startTime)}
            className="w-full"
            disableClock={true}
            clearIcon={null}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Time:</label>
          <TimePicker
            onChange={(value) => handleNewTimeChange('endTime', value)}
            value={convertTo24Hour(newEntry.endTime)}
            className="w-full"
            disableClock={true}
            clearIcon={null}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowAddForm(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleAddNewEntry}
          disabled={!newEntry.module || !newEntry.classroom || !newEntry.faculty || !newEntry.day}
          className={`px-4 py-2 rounded text-white ${
            !newEntry.module || !newEntry.classroom || !newEntry.faculty || !newEntry.day
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          Add Entry
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">View Timetable</h1>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Select Timetable:</label>
        <select
          value={timetableTitle}
          onChange={(e) => setTimetableTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">Select a timetable</option>
          {timetableNames.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleViewTimetable}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mb-6"
        disabled={isLoading || !timetableTitle}
      >
        {isLoading ? 'Loading...' : 'View Timetable'}
      </button>

      {error && <div className="text-red-500 mt-4 mb-6">{error}</div>}

      {timetable && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Timetable: {timetable.title}</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              {showAddForm ? 'Hide Add Form' : 'Add New Entry'}
            </button>
          </div>

          {showAddForm && renderAddEntryForm()}

          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            {timetable.entries.length > 0 ? (
              Object.entries(groupEntriesByDay(timetable.entries)).map(([day, entries]) => (
                <div key={day} className="mb-6">
                  <h3 className="text-lg font-bold mb-2">{day}</h3>
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-gray-200 p-2">Time</th>
                        <th className="border border-gray-300 bg-gray-200 p-2">Module</th>
                        <th className="border border-gray-300 bg-gray-200 p-2">Classroom</th>
                        <th className="border border-gray-300 bg-gray-200 p-2">Faculty</th>
                        <th className="border border-gray-300 bg-gray-200 p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={index}>
                          {editingEntry === entry._id ? (
                            <>
                              <td className="border border-gray-300 p-2">
                                <div className="grid grid-cols-1 gap-2">
                                  <select
                                    name="day"
                                    value={formData.day}
                                    onChange={handleInputChange}
                                    className="w-full px-2 py-1 border rounded"
                                    required
                                  >
                                    <option value="">Select Day</option>
                                    {daysOfWeek.map((day) => (
                                      <option key={day} value={day}>
                                        {day}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex space-x-2">
                                    <div>
                                      <label className="block text-xs">Start:</label>
                                      <TimePicker
                                        onChange={(value) => handleTimeChange('startTime', value)}
                                        value={convertTo24Hour(formData.startTime)}
                                        className="w-full"
                                        disableClock={true}
                                        clearIcon={null}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs">End:</label>
                                      <TimePicker
                                        onChange={(value) => handleTimeChange('endTime', value)}
                                        value={convertTo24Hour(formData.endTime)}
                                        className="w-full"
                                        disableClock={true}
                                        clearIcon={null}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-300 p-2">
                                <select
                                  name="module"
                                  value={formData.module}
                                  onChange={handleInputChange}
                                  className="w-full px-2 py-1 border rounded"
                                  required
                                >
                                  <option value="">Select Module</option>
                                  {modules.map((module) => (
                                    <option key={module._id} value={module._id}>
                                      {module.title}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="border border-gray-300 p-2">
                                <select
                                  name="classroom"
                                  value={formData.classroom}
                                  onChange={handleInputChange}
                                  className="w-full px-2 py-1 border rounded"
                                  required
                                >
                                  <option value="">Select Classroom</option>
                                  {classrooms.map((classroom) => (
                                    <option key={classroom._id} value={classroom._id}>
                                      {classroom.roomNumber}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="border border-gray-300 p-2">
                                <select
                                  name="faculty"
                                  value={formData.faculty}
                                  onChange={handleInputChange}
                                  className="w-full px-2 py-1 border rounded"
                                  required
                                >
                                  <option value="">Select Faculty</option>
                                  {faculty.map((fac) => (
                                    <option key={fac._id} value={fac._id}>
                                      {fac.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="border border-gray-300 p-2">
                                <button
                                  onClick={handleUpdateEntry}
                                  disabled={!formData.module || !formData.classroom || !formData.faculty || !formData.day}
                                  className={`bg-green-500 text-white px-2 py-1 rounded mr-2 ${
                                    !formData.module || !formData.classroom || !formData.faculty || !formData.day
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                  }`}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 text-white px-2 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="border border-gray-300 p-2">{entry.time}</td>
                              <td className="border border-gray-300 p-2">{entry.module?.title}</td>
                              <td className="border border-gray-300 p-2">{entry.classroom?.roomNumber || "N/A"}</td>
                              <td className="border border-gray-300 p-2">{entry.faculty?.name || "N/A"}</td>
                              <td className="border border-gray-300 p-2">
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                  Delete
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p>No entries found in this timetable.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;