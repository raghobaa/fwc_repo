import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
        // ✅ Prefer JWT token verification
        const token = localStorage.getItem("token");
        if (token) {
          const verifyRes = await fetch(`${BASE}/api/auth/verify-token`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.user.role);
            setIsAuth(true);
            return;
          }
        }
        // ❌ No valid token
        setIsAuth(false);
      } catch (err) {
        console.error("ProtectedRoute auth error:", err);
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg animate-pulse">🔐 Checking authentication...</p>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}
