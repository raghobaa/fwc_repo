import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromURL = params.get("token");
      const roleFromURL = params.get("role");

      if (tokenFromURL) {
        // ✅ Clear old data
        localStorage.clear();

        // ✅ Store token
        localStorage.setItem("token", tokenFromURL);

        if (roleFromURL) {
          localStorage.setItem("role", roleFromURL);
        }

        // Remove token from URL
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // ✅ Check token existence
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // ✅ Get role
      let role = localStorage.getItem("role");

      // If role not present (e.g. from Google login), fetch from backend
      if (!role) {
        try {
          const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
          const res = await fetch(`${BASE}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });

          if (res.ok) {
            const user = await res.json();
            role = user.role;
            localStorage.setItem("role", role);
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            // fallback to login
            navigate("/");
            return;
          }
        } catch (err) {
          console.error("DashboardRedirect fetch role error:", err);
          navigate("/");
          return;
        }
      }

      // ✅ Role based redirect (normalized to lowercase)
      const normalizedRole = role ? role.toLowerCase() : "";
      switch (normalizedRole) {
        case "hr":
          navigate("/hr");
          break;
        case "employee":
          navigate("/employee");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "candidate":
          navigate("/candidate");
          break;
        default:
          navigate("/");
          break;
      }
    };

    handleRedirect();
  }, [navigate]);

  return null;
}
