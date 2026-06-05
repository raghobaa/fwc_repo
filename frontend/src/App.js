import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import AuthForms from "./components/AuthForms";
import DashboardRedirect from "./pages/DashboardRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import SetupPage from "./pages/SetupPage";
import { ChatbotProvider } from "./context/ChatbotContext";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

// Admin Pages
import AdminUsersPage from "./pages/AdminUsersPage";

// Common Pages
import ViewApplications from "./pages/ViewApplications";
import EmployeeAttendancePage from "./pages/EmployeeAttendancePage";
import HRAttendancePage from "./pages/HRAttendancePage";

// HR Pages
import EmployeePayrollPage from "./pages/EmployeePayrollPage";
import EmployeeLeavePage from "./pages/EmployeeLeavePage";
import EmployeeFeedbackPage from "./pages/EmployeeFeedbackPage";
import HREmployeeManagementPage from "./pages/HREmployeeManagementPage";
import HRFeedbackPage from "./pages/HRFeedbackPage";
import HRLeaveRequestsPage from "./pages/HRLeaveRequestsPage";
import HRPayrollPage from "./pages/HRPayrollPage";

// Project & Interview Pages
import HRProjectsPage from "./pages/HRProjectsPage";
import EmployeeProjectsPage from "./pages/EmployeeProjectsPage";
import ResumeScreeningPage from "./pages/ResumeScreeningPage";
import AiInterviewPage from "./pages/AiInterviewPage";
import HRInterviewsPage from "./pages/HRInterviewsPage";
import InterviewRoomPage from "./pages/InterviewRoomPage";
import CandidateInterviewsPage from "./pages/CandidateInterviewsPage";
import HROnboardingPage from "./pages/HROnboardingPage";
import CandidateOnboardingPage from "./pages/CandidateOnboardingPage";
import HRTalentHeatmapPage from "./pages/HRTalentHeatmapPage";

function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideLayout = ["/", "/register", "/setup"].includes(location.pathname);

  return (
    <>
      {!hideLayout && <NavBar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ChatbotProvider>
        <LayoutWrapper>
          <Routes>
            {/* Public */}
            <Route path="/" element={<AuthForms />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* ADMIN */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            } />

            {/* HR */}
            <Route path="/hr" element={
              <ProtectedRoute allowedRoles={["HR"]}>
                <HRDashboard />
              </ProtectedRoute>
            } />
            <Route path="/hr/applications" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <ViewApplications />
              </ProtectedRoute>
            } />
            <Route path="/hr/attendance" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRAttendancePage />
              </ProtectedRoute>
            } />
            <Route path="/hr/employee-management" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HREmployeeManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/feedback" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRFeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/leave" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRLeaveRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/payroll" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRPayrollPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/projects" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/interviews" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRInterviewsPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/onboarding" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HROnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/resume-screening" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <ResumeScreeningPage />
              </ProtectedRoute>
            } />
            <Route path="/hr/talent-heatmap" element={
              <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                <HRTalentHeatmapPage />
              </ProtectedRoute>
            } />

            {/* EMPLOYEE */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/attendance" element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeAttendancePage />
              </ProtectedRoute>
            } />
            <Route path="/employee/payroll" element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeePayrollPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/leave" element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeLeavePage />
              </ProtectedRoute>
            } />
            <Route path="/employee/feedback" element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeFeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/projects" element={
              <ProtectedRoute allowedRoles={["Employee"]}>
                <EmployeeProjectsPage />
              </ProtectedRoute>
            } />

            {/* CANDIDATE */}
            <Route path="/candidate" element={
              <ProtectedRoute allowedRoles={["Candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidate/onboarding" element={
              <ProtectedRoute allowedRoles={["Candidate"]}>
                <CandidateOnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/interviews" element={
              <ProtectedRoute allowedRoles={["Candidate"]}>
                <CandidateInterviewsPage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/ai_interview" element={
              <ProtectedRoute allowedRoles={["Candidate"]}>
                <AiInterviewPage />
              </ProtectedRoute>
            } />

            {/* SHARED */}
            <Route path="/interview/room/:roomId" element={
              <ProtectedRoute allowedRoles={["HR", "Admin", "Candidate", "Employee"]}>
                <InterviewRoomPage />
              </ProtectedRoute>
            } />
          </Routes>
        </LayoutWrapper>
      </ChatbotProvider>
    </Router>
  );
}
