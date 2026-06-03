import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RoleRoute = ({ roles = [], children }) => {
  const { user, token } = useContext(AuthContext);
  if (!token) return <Navigate to="/" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default RoleRoute;
