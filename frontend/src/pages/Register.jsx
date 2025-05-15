import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", formData);
      
      // SweetAlert success notification
      await Swal.fire({
        title: "Success!",
        text: res.data.message,
        icon: "success",
        confirmButtonText: "Continue to Login",
        confirmButtonColor: "#3B82F6",
        showCancelButton: true,
        cancelButtonText: "Stay Here",
        cancelButtonColor: "#6B7280"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      
      // SweetAlert error notification
      Swal.fire({
        title: "Registration Failed",
        text: err.response?.data?.message || "Please try again",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444"
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            required
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Account Type</label>
          <select 
            name="role" 
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="user">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300 shadow-md"
        >
          Register Now
        </button>
      </form>
      
      <p className="text-center text-gray-600 mt-6">
        Already have an account?{" "}
        <a 
          href="/login" 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Sign in
        </a>
      </p>
    </div>
  );
};

export default Register;