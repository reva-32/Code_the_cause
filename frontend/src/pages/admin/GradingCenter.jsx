import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from "../../components/Sidebar";

export default function GradingCenter() {
    const [submissions, setSubmissions] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchSubmissions();
        const data = JSON.parse(localStorage.getItem("students")) || [];
        setStudents(data);
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/admin/submissions");
            setSubmissions(res.data);
        } catch (err) {
            console.error("Failed to fetch submissions");
        }
    };
    
    const handleGrade = async (studentName, obtained, total) => {
        if (!obtained || !total || total <= 0) {
            alert("Please enter valid marks.");
            return;
        }

        const score = parseInt(obtained);
        const maxScore = parseInt(total);
        const percentage = (score / maxScore) * 100;
        const isPassed = percentage >= 40;
        const result = isPassed ? "pass" : "fail";

        const student = students.find(s => s.name === studentName);
        if (!student) return alert("Student record not found in system.");

        const currentClass = student.levels?.maths || "Class 1";

        try {
            // 1. Update the promotion logic on the server
            const response = await axios.post("http://localhost:5000/api/admin/grade-exam", {
                studentName,
                result,
                currentClass
            });

            // 2. Update LocalStorage (Promotion Logic)
            const updatedStudents = students.map(s => {
                if (s.name === studentName) {
                    return {
                        ...s,
                        levels: {
                            ...s.levels,
                            maths: isPassed ? response.data.nextClass : currentClass
                        },
                        completedLessons: isPassed ? [] : s.completedLessons,
                        examStatus: "graded",
                        examResult: result,
                        examScore: `${score}/${maxScore} (${percentage.toFixed(1)}%)`
                    };
                }
                return s;
            });

            setStudents(updatedStudents);
            localStorage.setItem("students", JSON.stringify(updatedStudents));

            // 3. ✅ DELETE the file from the server so it disappears from the dashboard
            // We find the exact filename from the 'submissions' state list
            const submissionFile = submissions.find(f => f.filename.startsWith(studentName));

            if (submissionFile) {
                await axios.delete(`http://localhost:5000/api/admin/delete-submission/${submissionFile.filename}`);
            }

            // 4. Feedback & Refresh
            if (isPassed) {
                alert(`🎉 PASS! ${studentName} scored ${percentage.toFixed(1)}% and promoted to ${response.data.nextClass}.`);
            } else {
                alert(`⚠️ FAIL. ${studentName} scored ${percentage.toFixed(1)}% and remains in ${currentClass}.`);
            }

            fetchSubmissions(); // This will now show the updated folder content (minus the deleted file)

        } catch (error) {
            console.error("Grading error:", error);
            alert("Error updating grade or removing file.");
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
                <div style={headerStyle}>
                    <h2 style={{ color: "#1b4332", margin: 0 }}>Grading Center</h2>
                    <p style={{ color: "#64748b" }}>Calculate percentages and automate student promotions (Pass Mark: 40%)</p>
                </div>

                <div style={tableCard}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                                <th style={thStyle}>Student Answer Sheet</th>
                                <th style={thStyle}>Enter Marks</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((file, idx) => {
                                // Extract name from filename "StudentName_Timestamp_AnswerSheet.pdf"
                                const studentName = file.filename.split('_')[0];
                                return (
                                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={tdStyle}>
                                            <a href={file.url} target="_blank" rel="noreferrer" style={fileLink}>
                                                📄 {file.filename}
                                            </a>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Student: {studentName}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input
                                                    type="number"
                                                    id={`obt-${idx}`}
                                                    placeholder="Obt."
                                                    style={markInput}
                                                />
                                                <span style={{ color: "#94a3b8" }}>/</span>
                                                <input
                                                    type="number"
                                                    id={`tot-${idx}`}
                                                    placeholder="Total"
                                                    style={markInput}
                                                />
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => {
                                                    const obt = document.getElementById(`obt-${idx}`).value;
                                                    const tot = document.getElementById(`tot-${idx}`).value;
                                                    handleGrade(studentName, obt, tot);
                                                }}
                                                style={submitBtn}
                                            >
                                                Submit Grade
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {submissions.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            📭 No answer sheets pending for review.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Styles ---
const headerStyle = { marginBottom: "30px" };
const tableCard = { background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const thStyle = { padding: "15px", color: "#475569", fontWeight: "600", fontSize: "14px" };
const tdStyle = { padding: "15px", verticalAlign: "middle" };
const fileLink = { color: "#1b4332", textDecoration: "none", fontWeight: "600", display: "block", marginBottom: "4px" };
const markInput = { width: "70px", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", outline: "none" };
const submitBtn = {
    background: "#1b4332",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s"
};