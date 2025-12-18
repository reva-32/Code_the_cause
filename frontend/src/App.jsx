import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

/* AUTH */
import AdminLogin from "./auth/AdminLogin";
import GuardianLogin from "./auth/GuardianLogin";
import GuardianSignup from "./auth/GuardianSignup";
import StudentLogin from "./auth/StudentLogin";

/* PAGES / DASHBOARDS */
import AdminDashboard from "./pages/admin/adminDashboard";
import GuardianDashboard from "./pages/guardian/guardianDashboard";
import StudentDashboard from "./pages/students/studentDashboard";
import StudentProgress from "./pages/students/StudentProgress";
import TopicTest from "./pages/students/TopicTest";
import Lessons from "./pages/students/Lessons";

export default function App() {
  // Route Guards
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

  return (
    <BrowserRouter>
      <Routes>
        {/* LANDING */}
        <Route path="/" element={<LandingPage />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        />

        {/* GUARDIAN */}
        <Route path="/guardian/login" element={<GuardianLogin />} />
        <Route path="/guardian/signup" element={<GuardianSignup />} />
        <Route
          path="/guardian/dashboard"
          element={
            <ProtectedGuardian>
              <GuardianDashboard />
            </ProtectedGuardian>
          }
        />

        {/* STUDENT */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedStudent>
              <StudentDashboard />
            </ProtectedStudent>
          }
        />

        <Route
          path="/student/progress"
          element={
            <ProtectedStudent>
              <StudentProgress />
            </ProtectedStudent>
          }
        />

        <Route
          path="/student/lessons"
          element={
            <ProtectedStudent>
              <Lessons />
            </ProtectedStudent>
          }
        />

        <Route
          path="/student/topic-test"
          element={
            <ProtectedStudent>
              <TopicTest />
            </ProtectedStudent>
          }
        />

        <Route
          path="/student/test/:lessonId"
          element={
            <ProtectedStudent>
              <TopicTest />
            </ProtectedStudent>
          }
        />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
