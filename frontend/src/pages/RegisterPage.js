import React, { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = { role };
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Registered successfully");
    } else {
      alert(`❌ ${data.message}`);
    }
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
            Register to access the system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            <option value="">Select Role</option>
            <option value="Employee">Employee</option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
            <option value="Candidate">Candidate</option>
          </select>

          {/* Register Button - Indigo */}
          <button
            type="submit"
            className="w-full bg-[#1E3A8A] hover:bg-[#162c6a] text-white py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-400 text-sm">Or continue with</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Google Login Button - Indigo */}
        <button
          type="button"
          onClick={() => {
            const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
            window.location.href = `${BASE}/api/auth/google`;
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#162c6a] text-white py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5 bg-white rounded-full p-0.5"
          />
          <span>Login with Google</span>
        </button>

        {/* Link to Login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/"
            className="text-[#1E3A8A] font-semibold hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
