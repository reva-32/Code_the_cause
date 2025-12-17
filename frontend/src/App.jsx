import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

import AdminLogin from "./auth/AdminLogin";
import GuardianLogin from "./auth/GuardianLogin";
import GuardianSignup from "./auth/GuardianSignup";
import StudentLogin from "./auth/StudentLogin";

import AdminDashboard from "./pages/admin/AdminDashboard";
import GuardianDashboard from "./pages/guardian/GuardianDashboard";
import StudentDashboard from "./pages/students/StudentDashboard";
import StudentProgress from "./pages/students/StudentProgress";
import TopicTest from "./pages/students/TopicTest";
import Lessons from "./pages/students/Lessons";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/guardian/login" element={<GuardianLogin />} />
        <Route path="/guardian/signup" element={<GuardianSignup />} />
        <Route path="/guardian/dashboard" element={<GuardianDashboard />} />

        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/topic-test" element={<TopicTest />} />
        <Route path="/student/lessons" element={<Lessons />} />
      </Routes>
    </BrowserRouter>
  );
}
