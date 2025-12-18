import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentProgress from "../students/StudentProgress";

export default function StudentProgressPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const student = students[id];

    if (!student) {
        return <p style={{ padding: 20 }}>Student not found</p>;
    }

    return (
        <div className="content">
            <button onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h2 style={{ margin: "20px 0" }}>
                {student.name}'s Progress
            </h2>

            <StudentProgress student={student} />
        </div>
    );
}
