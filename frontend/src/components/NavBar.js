import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();

  const checkLogin = () => {
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    } else {
      fetch(`${BASE}/api/auth/user`, { credentials: "include" })
        .then((res) => setLoggedIn(res.ok))
        .catch(() => setLoggedIn(false));
    }
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener("authChange", checkLogin);
    return () => window.removeEventListener("authChange", checkLogin);
  }, []);

  const handleLogout = async () => {
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    try {
      await axios.get(`${BASE}/api/auth/logout`, { withCredentials: true });
    } catch {}
    setLoggedIn(false);
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  const isLoginPage = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 flex justify-between items-center px-8 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold text-gray-800">HRMS</div>
        
      </div>

      {!isLoginPage && loggedIn && (
        <button
          onClick={handleLogout}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
