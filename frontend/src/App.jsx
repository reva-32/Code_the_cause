import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

/* AUTH */
import AdminLogin from "./auth/AdminLogin";
import GuardianLogin from "./auth/GuardianLogin";
import GuardianSignup from "./auth/GuardianSignup";
import StudentLogin from "./auth/StudentLogin";

/* PAGES / DASHBOARDS */
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrphanageList from "./pages/admin/OrphanageList";
import StudentAnalytics from "./pages/admin/StudentAnalytics";
import ContentManager from "./pages/admin/ContentManager";
import ContentAnalytics from "./pages/admin/ContentAnalytics";
import VisitorLogs from "./pages/admin/VisitorLogs";
import GuardianDashboard from "./pages/guardian/guardianDashboard";
import StudentDashboard from "./pages/students/studentDashboard";
import StudentProgress from "./pages/students/StudentProgress";
import TopicTest from "./pages/students/TopicTest";
import Lessons from "./pages/students/Lessons";
import StudentProgressPage from "./pages/guardian/StudentProgressPage";
import StudentMedicalProfile from "./pages/guardian/StudentMedicalProfile";
import Instructions from "./pages/guardian/Instructions";
import AdminContentUpload from "./pages/admin/adminLessonUpload";
import HobbyHub from "./pages/students/HobbyHub";
import ADHDDashboard from "./pages/students/ADHDDashboard";
import DeafDashboard from "./pages/students/DeafDashboard";

// 1. IMPORT YOUR NEW REGISTRATION PAGE
import GuardianAddStudent from "./pages/guardian/addStudent";

import MentalHealthForm from "./pages/students/mentalHealthForm";

export default function App() {
  // ... (Keep your ProtectedStudent, ProtectedGuardian, ProtectedAdmin guards exactly as they are)

  const ProtectedStudent = ({ children }) => {
    const name = localStorage.getItem("loggedInStudent");
    if (!name) return <Navigate to="/student/login" />;
    return children;
  };

  const ProtectedGuardian = ({ children }) => {
    const loggedIn = localStorage.getItem("guardianLoggedIn");
    if (!loggedIn) return <Navigate to="/guardian/login" />;
    return children;
  };

  const ProtectedAdmin = ({ children }) => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (!loggedIn) return <Navigate to="/admin/login" />;
    return children;
  };

  const StudentDashboardSelector = () => {
  const name = localStorage.getItem("loggedInStudent");
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const student = students.find((s) => s.name === name);

  if (!student) return <Navigate to="/student/login" />;

  /*if (!student.placementDone) {
    return <StudentDashboard student={student} />;
  }*/

  const disability = student?.disability?.toLowerCase() || "";

  if (disability.includes("adhd")) {
    return <ADHDDashboard student={student} />;
  }

  if (disability.includes("deaf")) {
    return <DeafDashboard student={student} />;
  }

  // Default dashboard for others
  return <StudentDashboard student={student} />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* LANDING */}
        <Route path="/" element={<LandingPage />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
         <Route path="/admin/content" element={<AdminContentUpload />} />
          <Route
          path="/admin/orphanages"
          element={
            <ProtectedAdmin>
              <OrphanageList />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedAdmin>
              <StudentAnalytics />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedAdmin>
              <ContentManager />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/content/analytics"
          element={
            <ProtectedAdmin>
              <ContentAnalytics />
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/visitors"
          element={
            <ProtectedAdmin>
              <VisitorLogs />
            </ProtectedAdmin>
          }
        />

        {/* GUARDIAN */}
        <Route path="/guardian/login" element={<GuardianLogin />} />
        <Route path="/guardian/signup" element={<GuardianSignup />} />
        <Route path="/guardian/dashboard" element={<ProtectedGuardian><GuardianDashboard /></ProtectedGuardian>} />
        <Route path="/guardian/instructions" element={<Instructions />} />

        {/* 2. REGISTER THE NEW ADD STUDENT ROUTE HERE */}
        <Route
          path="/guardian/add-student"
          element={
            <ProtectedGuardian>
              <GuardianAddStudent />
            </ProtectedGuardian>
          }
        />
        <Route path="/guardian/medical-profile/:studentName" element={<StudentMedicalProfile />} />
        <Route path="/guardian/student/:id" element={<ProtectedGuardian><StudentProgressPage /></ProtectedGuardian>} />

        {/* STUDENT ROUTES */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/wellness-check" element={<ProtectedStudent><MentalHealthForm /></ProtectedStudent>} />
        <Route path="/student/dashboard" element={<ProtectedStudent><StudentDashboardSelector /></ProtectedStudent>} />
        <Route path="/student/progress" element={<ProtectedStudent><StudentProgress /></ProtectedStudent>} />
        <Route path="/student/lessons" element={<ProtectedStudent><Lessons /></ProtectedStudent>} />
        <Route path="/student/topic-test" element={<ProtectedStudent><TopicTest /></ProtectedStudent>} />
        <Route path="/student/test/:lessonId" element={<ProtectedStudent><TopicTest /></ProtectedStudent>} />
        <Route path="/student/hobby-hub" element={<HobbyHub />} />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}