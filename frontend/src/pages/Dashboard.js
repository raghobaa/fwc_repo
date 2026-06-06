import React, { useContext } from "react";
import { Container, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const role = user?.role || "Unknown";

  return (
    <Container style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Welcome{user?.name ? `, ${user.name}` : ""}!</h1>
      <p>Your role: <b>{role}</b></p>

      <div style={{ marginTop: "20px" }}>
        {role === "Admin" && <Button as={Link} to="/admin" variant="primary">Open Admin Dashboard</Button>}
        {role === "HR" && <Button as={Link} to="/hr" variant="success">Open HR Dashboard</Button>}
        {role === "Employee" && <Button as={Link} to="/employee" variant="info">Open Employee Dashboard</Button>}
      </div>
    </Container>
  );
}

export default Dashboard;