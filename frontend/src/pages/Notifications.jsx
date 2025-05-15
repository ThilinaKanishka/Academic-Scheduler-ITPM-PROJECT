import React from 'react';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: 'University Open Day',
      message: 'Join us for the University Open Day this Saturday from 10 AM to 2 PM.',
      date: 'March 27, 2025',
    },
    {
      id: 2,
      title: 'Course Registration Deadline',
      message: 'The deadline for course registration for the upcoming semester is April 1st.',
      date: 'March 25, 2025',
    },
    {
      id: 3,
      title: 'Guest Lecture on AI',
      message: 'A guest lecture on Artificial Intelligence will be held on April 5th in Room 101.',
      date: 'March 22, 2025',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">University Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
            <p className="text-gray-700 mt-2">{notification.message}</p>
            <p className="text-sm text-gray-500 mt-2">{notification.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
