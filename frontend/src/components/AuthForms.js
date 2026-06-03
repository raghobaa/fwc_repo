import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";

function AuthForms() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const firstTime = params.get("firstTime");
    if (firstTime) {
      alert("👉 Please sign up using email and password for the first time.");
    }
  }, [location]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await API.post(endpoint, formData);

      localStorage.clear();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("authChange"));

      alert(`${isLogin ? "Login" : "Signup"} successful!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Auth error:", err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleGoogleLogin = () => {
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.location.href = `${BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Top Branding */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
            HRMS Portal
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? "Welcome back! Please sign in." : "Create your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          {!isLogin && (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
              <option value="Candidate">Candidate</option>
            </select>
          )}
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-400 text-sm">Or continue with</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 py-3 rounded-lg transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">Login with Google</span>
        </button>

        {/* Toggle between Login and Register */}
        <p
          className="mt-6 text-center text-sm text-gray-600 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? (
            <>
              New user?{" "}
              <span className="text-black font-semibold hover:underline">
                Sign up now
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="text-black font-semibold hover:underline">
                Login here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthForms;
