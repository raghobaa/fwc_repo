import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

export default function SetupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadySetup, setAlreadySetup] = useState(false);

  // Check if admin already exists — if so, disable the form
  useEffect(() => {
    API.post("/auth/setup", {})
      .catch((err) => {
        if (err.response?.status === 409) setAlreadySetup(true);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/setup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      localStorage.clear();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Setup failed. Please try again.");
      if (err.response?.status === 409) setAlreadySetup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">System Setup</h1>
          <p className="text-gray-500 text-sm mt-1">Create the Administrator account</p>
        </div>

        {alreadySetup ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
              An Admin account already exists. Setup is complete.
            </div>
            <Link
              to="/"
              className="block w-full text-center bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg">
              This page is only accessible when no Admin account exists. Once you create the admin, this form will be disabled.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Admin Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="password"
                name="password"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <input
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                value={formData.confirm}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition"
              >
                {loading ? "Creating Admin..." : "Create Admin Account"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/" className="text-black font-semibold hover:underline">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
