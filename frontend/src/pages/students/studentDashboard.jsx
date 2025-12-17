import React, { useEffect, useState } from "react";
import TopicTest from "./TopicTest";
import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import "../../App.css";
import { shouldShowTest } from "../../data/promotionRules";

// SWITCH STUDENT HERE
const loggedInStudent = "anaya"; // "rahul"

const dummyStudents = {
  rahul: { name: "Rahul", disability: false },
  anaya: { name: "Anaya", disability: true },
};

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(`student_${loggedInStudent}`)
    );

    if (saved) {
      setStudent(saved);
    } else {
      setStudent({
        ...dummyStudents[loggedInStudent],
        placementDone: false,
        scores: {},
        classLevel: {},
      });
    }
  }, []);

  const handlePlacementComplete = (data) => {
    const updatedStudent = {
      ...student,
      ...data,
    };

    localStorage.setItem(
      `student_${loggedInStudent}`,
      JSON.stringify(updatedStudent)
    );

    setStudent(updatedStudent);
  };

  if (!student) return null;

  return (
    <div className="app-container">
      <div className="topbar">
        <div className="logo">
          Student Dashboard – {student.name}
        </div>
      </div>

      <div className="content">
        {!student.placementDone ? (
          <PlacementTest
            student={student}
            onComplete={handlePlacementComplete}
          />
        ) : (
          <>
            <StudentProgress student={student} />
            <Lessons student={student} />
          </>
        )}
      </div>
    </div>
  );
}
