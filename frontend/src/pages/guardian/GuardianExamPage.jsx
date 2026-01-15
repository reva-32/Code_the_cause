import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// IMPORTANT: If you have a lessons data file, importing it helps the fallback logic
// import { lessons as staticLessons } from "../../data/lessons"; 

export default function GuardianExamPage() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);

    // ✅ Load students from localStorage and keep them in sync
    useEffect(() => {
        const loadData = () => {
            const data = JSON.parse(localStorage.getItem("students")) || [];
            setStudents(data);
        };
        loadData();
        // Listen for storage changes (helpful if grading happens in another tab)
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    const handleDownload = (level, subject, disability) => {
        let studentGroup = (disability === "Visually Impaired" || disability === "Blind") ? "Blind" : "Standard";

        // Match the backend folder naming: "Class 1" -> "Class_1"
        const cleanLevel = level ? level.replace(/\s+/g, "_") : "Class_1";
        const fileUrl = `http://localhost:5000/uploads/exams/${subject}/${studentGroup}/${cleanLevel}_Final_Exam.pdf`;

        window.open(fileUrl, "_blank");
    };

    const handleFileSubmit = async (studentName, subject) => {
        const inputId = subject === "Maths" ? `file-maths-${studentName}` : `file-science-${studentName}`;
        const fileInput = document.getElementById(inputId);
        const file = fileInput?.files[0];

        if (!file) {
            alert(`Please select the ${subject} answer sheet.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", subject);
        formData.append("studentName", studentName);

        try {
            const response = await fetch("http://localhost:5000/api/guardian/upload-answers", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert(`✅ ${subject} answer sheet submitted!`);

                const updatedStudents = students.map((s) => {
                    if (s.name === studentName) {
                        // Ensure examStatus is an object before updating
                        const currentStatus = s.examStatus && typeof s.examStatus === 'object' ? s.examStatus : {};
                        return {
                            ...s,
                            examStatus: { ...currentStatus, [subject.toLowerCase()]: "submitted" }
                        };
                    }
                    return s;
                });
                setStudents(updatedStudents);
                localStorage.setItem("students", JSON.stringify(updatedStudents));
            }
        } catch (error) {
            alert("❌ Connection to server failed.");
        }
    };
    // Inside your Admin/Grading Component
    const handleGradeSubmit = async (studentName, subject, status) => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/grade-exam", {
                method: "POST",
                body: JSON.stringify({ studentName, subject, status })
            });

            if (response.ok && status === 'pass') {
                // ✅ CALL THE PROMOTION LOGIC HERE
                promoteStudent(studentName, subject);
                alert(`${studentName} has been promoted to the next level!`);
            }
        } catch (error) {
            console.error("Grading failed", error);
        }
    };

    // Put the promoteStudent function outside the component or as a helper
    const promoteStudent = (studentName, subject) => {
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const updated = students.map(s => {
            if (s.name === studentName) {
                const currentLevel = s.levels?.[subject.toLowerCase()] || "Class 1";

                // Logic to calculate next level string
                const currentNum = parseInt(currentLevel.replace("Class ", ""));
                const nextLevel = `Class ${currentNum + 1}`;

                return {
                    ...s,
                    // Reset progress for the new level
                    completedMathsLessons: subject.toLowerCase() === 'maths' ? [] : s.completedMathsLessons,
                    completedScienceLessons: subject.toLowerCase() === 'science' ? [] : s.completedScienceLessons,
                    levels: {
                        ...s.levels,
                        [subject.toLowerCase()]: nextLevel
                    },
                    examResult: {
                        ...s.examResult,
                        [subject.toLowerCase()]: 'pass'
                    },
                    examStatus: {
                        ...s.examStatus,
                        [subject.toLowerCase()]: 'graded'
                    }
                };
            }
            return s;
        });
        localStorage.setItem("students", JSON.stringify(updated));
        // This triggers the 'storage' event listener in the Student tab
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>Examination Center</h1>
                <p style={styles.subtitle}>Final exams unlock once all subject lessons are completed.</p>
            </div>

            <div style={styles.grid}>
                {students.map((s) => {
                    /**
                     * ✅ FIX: Robust Eligibility Logic
                     * Checks for the new subject-specific arrays AND the old general array
                     * as a fallback to ensure the exam unlocks correctly.
                     */
                    const isMathsEligible = (s.completedMathsLessons?.length > 0) || (s.completedLessons?.length > 0);
                    const isScienceEligible = (s.completedScienceLessons?.length > 0) || (s.completedLessons?.length > 0);

                    const mathsStatus = s.examStatus?.maths;
                    const scienceStatus = s.examStatus?.science;

                    return (
                        <div key={s.name} style={styles.card}>
                            {/* Promotion Alerts: Checks the new object structure */}
                            {s.examResult?.maths === 'pass' && (
                                <div style={styles.promotionAlert}>🎊 Maths Passed! Promoted to {s.levels?.maths}</div>
                            )}
                            {s.examResult?.science === 'pass' && (
                                <div style={styles.promotionAlert}>🎊 Science Passed! Promoted to {s.levels?.science}</div>
                            )}

                            <div style={styles.cardHeader}>
                                <h2 style={styles.studentName}>{s.name}</h2>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <span style={styles.classBadge}>M: {s.levels?.maths || "Class 1"}</span>
                                    <span style={styles.classBadge}>S: {s.levels?.science || "Class 1"}</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                                {/* MATHEMATICS SECTION */}
                                <div style={isMathsEligible ? styles.unlockedBox : styles.lockedBox}>
                                    <p style={styles.subjectLabel}>📐 Mathematics</p>
                                    {isMathsEligible ? (
                                        mathsStatus === "submitted" ? <div style={styles.pendingBox}>⏳ Maths Awaiting Grade</div> :
                                            mathsStatus === "graded" ? <div style={styles.doneBox}>✅ Maths Graded</div> :
                                                <>
                                                    <button onClick={() => handleDownload(s.levels?.maths || "Class 1", "Maths", s.disability)} style={styles.mathBtn}>Download Maths Paper</button>
                                                    <input type="file" id={`file-maths-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                    <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Maths")}>Submit Maths Answers</button>
                                                </>
                                    ) : (
                                        <p style={styles.lockText}>🔒 Complete all Maths lessons to unlock this exam.</p>
                                    )}
                                </div>

                                {/* SCIENCE SECTION */}
                                <div style={isScienceEligible ? styles.unlockedBox : styles.lockedBox}>
                                    <p style={styles.subjectLabel}>🧪 Science</p>
                                    {isScienceEligible ? (
                                        scienceStatus === "submitted" ? <div style={styles.pendingBox}>⏳ Science Awaiting Grade</div> :
                                            scienceStatus === "graded" ? <div style={styles.doneBox}>✅ Science Graded</div> :
                                                <>
                                                    <button onClick={() => handleDownload(s.levels?.science || "Class 1", "Science", s.disability)} style={styles.sciBtn}>Download Science Paper</button>
                                                    <input type="file" id={`file-science-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                    <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Science")}>Submit Science Answers</button>
                                                </>
                                    ) : (
                                        <p style={styles.lockText}>🔒 Complete all Science lessons to unlock this exam.</p>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: "1100px", margin: "0 auto", padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" },
    header: { marginBottom: "30px" },
    backBtn: { background: "none", border: "none", color: "#065f46", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginBottom: "10px" },
    title: { fontSize: "32px", color: "#064e3b", margin: 0 },
    subtitle: { color: "#64748b", marginTop: "5px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
    card: { background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" },
    promotionAlert: { background: "#16a34a", color: "white", padding: "10px", borderRadius: "8px", fontSize: "13px", textAlign: "center", marginBottom: "15px", fontWeight: "bold" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    studentName: { margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: "700" },
    classBadge: { background: "#f1f5f9", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", color: "#475569" },
    unlockedBox: { background: "#f0fdf4", padding: "15px", borderRadius: "12px", border: "1px solid #05966930" },
    lockedBox: { background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", opacity: 0.8 },
    pendingBox: { padding: "12px", background: "#fef9c3", color: "#854d0e", borderRadius: "8px", fontSize: "12px", textAlign: "center", border: "1px dashed #ca8a04", fontWeight: "600" },
    doneBox: { padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "12px", textAlign: "center", fontWeight: "600" },
    subjectLabel: { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#334155" },
    mathBtn: { width: "100%", padding: "10px", background: "#1e40af", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "8px", fontWeight: "600" },
    sciBtn: { width: "100%", padding: "10px", background: "#0891b2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "8px", fontWeight: "600" },
    fileInput: { fontSize: "11px", width: "100%", marginBottom: "10px", color: "#64748b" },
    submitBtn: { width: "100%", padding: "10px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
    lockText: { fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.4" }
};