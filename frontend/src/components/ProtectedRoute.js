import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// Maps a role to its home dashboard path
const ROLE_HOME = {
  Admin: "/admin",
  HR: "/hr",
  Employee: "/employee",
  Candidate: "/candidate",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "unauth" | "forbidden"
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");

        if (!token) { setStatus("unauth"); return; }

        const res = await fetch(`${BASE}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.clear();
          setStatus("unauth");
          return;
        }

        const data = await res.json();
        const role = data.user.role;

        // Keep localStorage in sync with the server's role
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", role);
        setUserRole(role);

        // If a role restriction is set, enforce it
        if (allowedRoles && !allowedRoles.includes(role)) {
          setStatus("forbidden");
        } else {
          setStatus("ok");
        }
      } catch {
        setStatus("unauth");
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Checking access...</p>
      </div>
    );
  }

  if (status === "unauth") return <Navigate to="/" replace />;

  // User is logged in but accessing the wrong role's area → send them to their own dashboard
  if (status === "forbidden") {
    const home = ROLE_HOME[userRole] || "/";
    return <Navigate to={home} replace />;
  }

  return children;
}
