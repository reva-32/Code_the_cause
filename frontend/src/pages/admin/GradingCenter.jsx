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
    
    const handleGrade = async (filename, obtained, total) => {
        if (!obtained || !total || total <= 0) {
            alert("Please enter valid marks.");
            return;
        }

        // 1. Identify Student and Subject
        const studentNameFromFile = filename.split('_')[0];
        const subject = filename.toLowerCase().includes("science") ? "science" : "maths";

        const score = parseInt(obtained);
        const maxScore = parseInt(total);
        const percentage = (score / maxScore) * 100;
        const isPassed = percentage >= 40;
        const result = isPassed ? "pass" : "fail";

        // 2. Fetch Latest Local Data
        const allStudents = JSON.parse(localStorage.getItem("students")) || [];
        const studentIdx = allStudents.findIndex(s => s.name.toLowerCase() === studentNameFromFile.toLowerCase());

        if (studentIdx === -1) {
            alert(`Student "${studentNameFromFile}" not found.`);
            return;
        }

        const student = allStudents[studentIdx];
        const currentClassStr = student.levels?.[subject] || "Class 1";

        try {
            // 3. API Call to get next class name from server
            const response = await axios.post("http://localhost:5000/api/admin/grade-exam", {
                studentName: student.name,
                result,
                currentClass: currentClassStr
            });

            const updatedStudent = { ...student };

            // Ensure objects exist
            if (!updatedStudent.levels) updatedStudent.levels = { maths: "Class 1", science: "Class 1" };
            if (!updatedStudent.examResult) updatedStudent.examResult = {};
            if (!updatedStudent.examStatus) updatedStudent.examStatus = {};

            if (isPassed) {
                // 1. FORCED CALCULATION (Don't trust the server for the class name)
                // This removes everything except the digits and adds 1
                const currentNumber = parseInt(currentClassStr.replace(/\D/g, "")) || 1;
                const nextLevel = `Class ${currentNumber + 1}`;

                console.log(`Promoting from ${currentClassStr} to ${nextLevel}`);

                // 2. APPLY TO STUDENT OBJECT
                updatedStudent.levels[subject] = nextLevel;

                // 3. WIPE PROGRESS FOR THE NEW CLASS
                if (subject === "science") {
                    updatedStudent.completedScienceLessons = [];
                } else {
                    updatedStudent.completedMathsLessons = [];
                }

                // 4. RESET EXAM STATUS
                updatedStudent.examStatus[subject] = "none";
                updatedStudent.examResult[subject] = null;

            } else {
                updatedStudent.examStatus[subject] = "graded";
                updatedStudent.examResult[subject] = "fail";
            }
            
            allStudents[studentIdx] = updatedStudent;
            localStorage.setItem("students", JSON.stringify(allStudents));

            // Delete file from server
            await axios.delete(`http://localhost:5000/api/admin/delete-submission/${filename}`);

            alert(`${isPassed ? "🎉 PROMOTED" : "❌ FAILED"}: ${student.name} is now in ${updatedStudent.levels[subject]}`);

            setStudents(allStudents);
            fetchSubmissions();

        } catch (error) {
            console.error("Grading error:", error);
            alert("Server failed to process grading.");
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
                <div style={headerStyle}>
                    <h2 style={{ color: "#1b4332", margin: 0 }}>Grading Center</h2>
                    <p style={{ color: "#64748b" }}>Grade student answer sheets to trigger promotions.</p>
                </div>

                <div style={tableCard}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                                <th style={thStyle}>Answer Sheet</th>
                                <th style={thStyle}>Marks</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((file, idx) => (
                                <tr key={file.filename} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>
                                        <a href={file.url} target="_blank" rel="noreferrer" style={fileLink}>
                                            📄 {file.filename}
                                        </a>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            Student: {file.filename.split('_')[0]}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <input type="number" id={`obt-${idx}`} placeholder="Obt." style={markInput} />
                                            <span style={{ color: "#94a3b8" }}>/</span>
                                            <input type="number" id={`tot-${idx}`} placeholder="100" style={markInput} />
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <button 
                                            onClick={() => {
                                                const obt = document.getElementById(`obt-${idx}`).value;
                                                const tot = document.getElementById(`tot-${idx}`).value;
                                                handleGrade(file.filename, obt, tot);
                                            }}
                                            style={submitBtn}
                                        >
                                            Submit Grade
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {submissions.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            📭 No answer sheets pending.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const headerStyle = { marginBottom: "30px" };
const tableCard = { background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const thStyle = { padding: "15px", color: "#475569", fontWeight: "600", fontSize: "14px" };
const tdStyle = { padding: "15px", verticalAlign: "middle" };
const fileLink = { color: "#1b4332", textDecoration: "none", fontWeight: "600", display: "block", marginBottom: "4px" };
const markInput = { width: "70px", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", outline: "none" };
const submitBtn = { background: "#1b4332", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" };