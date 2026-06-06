import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AuthForms from "./components/AuthForms";
import DashboardRedirect from "./pages/DashboardRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatbotProvider } from "./context/ChatbotContext";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

// Common Pages
import ViewApplications from "./pages/ViewApplications";
import EmployeeAttendancePage from "./pages/EmployeeAttendancePage";
import HRAttendancePage from "./pages/HRAttendancePage";
import EmployeePayrollPage from "./pages/EmployeePayrollPage";
import EmployeeLeavePage from "./pages/EmployeeLeavePage";
import EmployeeFeedbackPage from "./pages/EmployeeFeedbackPage";
import HREmployeeManagementPage from "./pages/HREmployeeManagementPage";
import HRFeedbackPage from "./pages/HRFeedbackPage";
import HRLeaveRequestsPage from "./pages/HRLeaveRequestsPage";
import HRPayrollPage from "./pages/HRPayrollPage";
import HRProjectsPage from "./pages/HRProjectsPage";
import EmployeeProjectsPage from "./pages/EmployeeProjectsPage";
import ResumeScreeningPage from "./pages/ResumeScreeningPage";
import AiInterviewPage from "./pages/AiInterviewPage";
import HRInterviewsPage from "./pages/HRInterviewsPage";
import InterviewRoomPage from "./pages/InterviewRoomPage";
import CandidateInterviewsPage from "./pages/CandidateInterviewsPage";
import HROnboardingPage from "./pages/HROnboardingPage";
import CandidateOnboardingPage from "./pages/CandidateOnboardingPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import RealTimeInterview from "./pages/RealTimeInterview";
import WrittenInterview from "./pages/WrittenInterview";
import SkillGapAnalyzer from "./pages/SkillGapAnalyzer";
import SmartJobFinder from "./pages/SmartJobFinder";
import SkillTrackerPage from "./pages/SkillTrackerPage";
import InterviewAnalyticsPage from "./pages/InterviewAnalyticsPage";
import EmployeeDashboardNew from "./pages/EmployeeDashboard"; // your enhanced dashboard
import AiIdeaHubPage from "./pages/AiIdeaHubPage";
import AiWorkAssistantPage from "./pages/AiWorkAssistantPage";
import EmployeeTasksPage from "./pages/EmployeeTasksPage";
function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideNavAndFooterRoutes = ["/", "/register"];
  return (
    <>
      {!hideNavAndFooterRoutes.includes(location.pathname) && <NavBar />}
      {children}
      {!hideNavAndFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ChatbotProvider>
        <LayoutWrapper>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<AuthForms />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

<Route path="/employee/ai-assistant" element={<ProtectedRoute><AiWorkAssistantPage /></ProtectedRoute>} />
            {/* HR */}
            <Route path="/hr" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
            <Route path="/hr/applications" element={<ProtectedRoute><ViewApplications /></ProtectedRoute>} />
            <Route path="/hr/attendance" element={<ProtectedRoute><HRAttendancePage /></ProtectedRoute>} />
            <Route path="/hr/employee-management" element={<ProtectedRoute><HREmployeeManagementPage /></ProtectedRoute>} />
            <Route path="/hr/feedback" element={<ProtectedRoute><HRFeedbackPage /></ProtectedRoute>} />
            <Route path="/hr/leave" element={<ProtectedRoute><HRLeaveRequestsPage /></ProtectedRoute>} />
            <Route path="/hr/payroll" element={<ProtectedRoute><HRPayrollPage /></ProtectedRoute>} />
            <Route path="/hr/projects" element={<ProtectedRoute><HRProjectsPage /></ProtectedRoute>} />
            <Route path="/hr/interviews" element={<ProtectedRoute><HRInterviewsPage /></ProtectedRoute>} />
            <Route path="/hr/onboarding" element={<ProtectedRoute><HROnboardingPage /></ProtectedRoute>} />
            <Route path="/hr/resume-screening" element={<ProtectedRoute><ResumeScreeningPage /></ProtectedRoute>} />

            {/* Employee */}
            <Route path="/employee" element={<ProtectedRoute><EmployeeDashboardNew /></ProtectedRoute>} />
            <Route path="/employee/attendance" element={<ProtectedRoute><EmployeeAttendancePage /></ProtectedRoute>} />
            <Route path="/employee/payroll" element={<ProtectedRoute><EmployeePayrollPage /></ProtectedRoute>} />
            <Route path="/employee/leave" element={<ProtectedRoute><EmployeeLeavePage /></ProtectedRoute>} />
            <Route path="/employee/feedback" element={<ProtectedRoute><EmployeeFeedbackPage /></ProtectedRoute>} />
            <Route path="/employee/projects" element={<ProtectedRoute><EmployeeProjectsPage /></ProtectedRoute>} />
<Route path="/employee/tasks" element={<ProtectedRoute><EmployeeTasksPage /></ProtectedRoute>} />
            {/* Candidate */}
            <Route path="/candidate" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/candidate/onboarding" element={<ProtectedRoute><CandidateOnboardingPage /></ProtectedRoute>} />
            <Route path="/candidate/interviews" element={<ProtectedRoute><CandidateInterviewsPage /></ProtectedRoute>} />
            <Route path="/candidate/ai_interview" element={<ProtectedRoute><AiInterviewPage /></ProtectedRoute>} />
            <Route path="/candidate/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/candidate/skill-tracker" element={<ProtectedRoute><SkillTrackerPage /></ProtectedRoute>} />
            <Route path="/candidate/skill-gap" element={<ProtectedRoute><SkillGapAnalyzer /></ProtectedRoute>} />
            <Route path="/candidate/jobs" element={<ProtectedRoute><SmartJobFinder /></ProtectedRoute>} />
            <Route path="/candidate/interview-analytics" element={<ProtectedRoute><InterviewAnalyticsPage /></ProtectedRoute>} />
<Route path="/employee/ai-ideas" element={<ProtectedRoute><AiIdeaHubPage /></ProtectedRoute>} />
<Route path="/hr/ai-ideas" element={<ProtectedRoute><AiIdeaHubPage /></ProtectedRoute>} />
            {/* Interview routes */}
            <Route path="/interview/real-time" element={<RealTimeInterview />} />
            <Route path="/interview/written" element={<WrittenInterview />} />
            <Route path="/interview/room/:roomId" element={<ProtectedRoute><InterviewRoomPage /></ProtectedRoute>} />
          </Routes>
        </LayoutWrapper>
      </ChatbotProvider>
    </Router>
  );
}