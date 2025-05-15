import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import Swal from 'sweetalert2'; // Import SweetAlert

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      
      // SweetAlert success notification
      await Swal.fire({
        title: "Success!",
        text: "Login successful",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#4CAF50",
        timer: 2000,
        timerProgressBar: true
      });
      
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      
      // SweetAlert error notification
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Login failed",
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "#F44336"
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;