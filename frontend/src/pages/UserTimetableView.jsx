import React, { useState, useEffect } from "react";
import { 
  fetchTimetableByName, 
  fetchAllTimetableNames
} from "../api/timetableApi";
import Swal from 'sweetalert2';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const UserTimetableView = () => {
  const [timetableTitle, setTimetableTitle] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState("");
  const [timetableNames, setTimetableNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch timetable names
  useEffect(() => {
    const fetchNames = async () => {
      try {
        setIsLoading(true);
        const names = await fetchAllTimetableNames();
        setTimetableNames(names);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch timetable names',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchNames();
  }, []);

  // Format time for display
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
          <h2 className="text-xl font-semibold mb-4">Timetable: {timetable.title}</h2>

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
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{entry.time}</td>
                          <td className="border border-gray-300 p-2">{entry.module?.title}</td>
                          <td className="border border-gray-300 p-2">{entry.classroom?.roomNumber || "N/A"}</td>
                          <td className="border border-gray-300 p-2">{entry.faculty?.name || "N/A"}</td>
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

export default UserTimetableView;