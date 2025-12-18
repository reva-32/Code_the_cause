import React, { useEffect, useState } from "react";
import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import PlacementTest from "./PlacementTest"; // new component
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);
    if (!loggedIn) return;
    setStudent(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInStudent");
    navigate("/");
  };

  if (!student) return <p>Login required</p>;

  return (
    <div className="app-container">
      <div className="topbar">
        <h2>Welcome, {student.name}</h2>
        <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      </div>

      {!student.placementDone ? (
        <PlacementTest student={student} setStudent={setStudent} />
      ) : (
        <>
          <StudentProgress student={student} />
          <Lessons student={student} />
        </>
      )}
    </div>
  );
}
