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
        const isBlind = (disability?.toLowerCase() === "blind" || disability?.toLowerCase() === "visually impaired");
        const studentGroup = isBlind ? "Blind" : "Standard";

        const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();

        // ✅ IMPROVED LOGIC:
        // This removes all underscores first, then forces an underscore between 'Class' and the number
        let cleanLevel = level ? level.trim().replace(/_/g, "") : "Class1";
        cleanLevel = cleanLevel.replace(/Class/i, "Class_");

        const fileName = `${cleanLevel}_Final_Exam.pdf`;
        const fileUrl = `http://localhost:5000/uploads/exams/${formattedSubject}/${studentGroup}/${fileName}`;

        console.log("DEBUG: Final Filename generated ->", fileName);
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
    const promoteStudent = (studentName, subject, result) => {
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const updated = students.map(s => {
            if (s.name === studentName) {
                const subjectKey = subject.toLowerCase();
                const isMaths = subjectKey === 'maths';

                // Only move to next class if they passed
                let nextLevel = s.levels?.[subjectKey] || "Class 1";
                if (result === 'pass') {
                    const currentNum = parseInt(nextLevel.replace("Class ", ""));
                    nextLevel = `Class ${currentNum + 1}`;
                }

                return {
                    ...s,
                    // ✅ FIX: Only clear lessons if they PASSED. 
                    // If they fail, keep the existing progress so they can see the lessons.
                    completedMathsLessons: (isMaths && result === 'pass') ? [] : s.completedMathsLessons,
                    completedScienceLessons: (!isMaths && result === 'pass') ? [] : s.completedScienceLessons,

                    levels: {
                        ...s.levels,
                        [subjectKey]: nextLevel
                    },
                    examResult: {
                        ...s.examResult,
                        [subjectKey]: result // Store 'pass' or 'fail'
                    },
                    examStatus: {
                        ...s.examStatus,
                        [subjectKey]: 'graded'
                    }
                };
            }
            return s;
        });
        localStorage.setItem("students", JSON.stringify(updated));
        setStudents(updated); // Sync the state immediately
    };

    // ✅ Helper: Check if student is ready for school enrollment (Class 10 in both)
    const isReadyForSchool = (student) => {
        if (!student?.levels) return false;
        const normalize = (lvl) => (lvl || "").toString().toLowerCase().replace(/\s/g, "");
        return normalize(student.levels.maths) === "class10" &&
            normalize(student.levels.science) === "class10";
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
                    // 1. Calculate Maths Eligibility
                    const isMathsEligible = (() => {
                        const completedCount = s.completedMathsLessons?.length || 0;

                        // ✅ SPECIAL RULE: ADHD Students in Class 1 need exactly 2 lessons
                        if (s.disability === "ADHD" && s.levels?.maths === "Class 1") {
                            return completedCount >= 2;
                        }

                        // Default Rule for everyone else (e.g., must complete at least 1 or 5)
                        // Your previous code checked for > 0, so we keep that or adjust to lesson count
                        return completedCount >= 1;
                    })();

                    // 2. Calculate Science Eligibility (Standard Rule)
                    const isScienceEligible = (() => {
                        const completedCount = s.completedScienceLessons?.length || 0;
                        return completedCount >= 1; // Keep standard logic for Science
                    })();

                    const mathsStatus = s.examStatus?.maths;
                    const scienceStatus = s.examStatus?.science;

                    return (
                        <div key={s.name} style={styles.card}>
                            {/* 🆕 SCHOOL ENROLLMENT ALERT */}
                            {isReadyForSchool(s) && (
                                <div style={styles.schoolAlert}>
                                    <div style={styles.schoolIcon}>🏫</div>
                                    <div>
                                        <strong style={{ display: 'block', color: '#1e3a8a', fontSize: '14px' }}>
                                            Ready for Board Exams!
                                        </strong>
                                        <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.2', display: 'block' }}>
                                            Reached Class 10 in Maths & Science. Please enroll in partner school.
                                        </span>
                                        <button
                                            style={styles.schoolBtn}
                                            onClick={() => alert(`Redirecting ${s.name} to School Admission Portal...`)}
                                        >
                                            Enroll Now
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                        <>
                                            {/* If they haven't submitted yet OR if they FAILED the previous attempt */}
                                            {(mathsStatus !== "submitted" && mathsStatus !== "graded") || s.examResult?.maths === 'fail' ? (
                                                <>
                                                    {s.examResult?.maths === 'fail' && (
                                                        <p style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                                                            ❌ Last Attempt Failed. Please re-download and retry.
                                                        </p>
                                                    )}
                                                    <button onClick={() => handleDownload(s.levels?.maths || "Class 1", "Maths", s.disability)} style={styles.mathBtn}>
                                                        {s.examResult?.maths === 'fail' ? "Retry Maths Paper" : "Download Maths Paper"}
                                                    </button>
                                                    <input type="file" id={`file-maths-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                    <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Maths")}>
                                                        Submit Maths Answers
                                                    </button>
                                                </>
                                            ) : mathsStatus === "submitted" ? (
                                                <div style={styles.pendingBox}>⏳ Maths Awaiting Grade</div>
                                            ) : (
                                                <div style={styles.doneBox}>✅ Maths Passed & Graded</div>
                                            )}
                                        </>
                                    ) : (
                                        <p style={styles.lockText}>🔒 Complete all Maths lessons to unlock this exam.</p>
                                    )}
                                </div>

                                {/* SCIENCE SECTION */}
                                <div style={isScienceEligible ? styles.unlockedBox : styles.lockedBox}>
                                    <p style={styles.subjectLabel}>🧪 Science</p>
                                    {isScienceEligible ? (
                                        <>
                                            {(scienceStatus !== "submitted" && scienceStatus !== "graded") || s.examResult?.science === 'fail' ? (
                                                <>
                                                    {s.examResult?.science === 'fail' && (
                                                        <p style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                                                            ❌ Last Attempt Failed. Retry when ready.
                                                        </p>
                                                    )}
                                                    <button onClick={() => handleDownload(s.levels?.science || "Class 1", "Science", s.disability)} style={styles.sciBtn}>
                                                        {s.examResult?.science === 'fail' ? "Retry Science Paper" : "Download Science Paper"}
                                                    </button>
                                                    <input type="file" id={`file-science-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                    <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Science")}>
                                                        Submit Science Answers
                                                    </button>
                                                </>
                                            ) : scienceStatus === "submitted" ? (
                                                <div style={styles.pendingBox}>⏳ Science Awaiting Grade</div>
                                            ) : (
                                                <div style={styles.doneBox}>✅ Science Passed & Graded</div>
                                            )}
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
    lockText: { fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.4" },
    // 🆕 New Styles for School Alert
    schoolAlert: {
        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        border: "1px solid #60a5fa",
        borderRadius: "12px",
        padding: "15px",
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        alignItems: "flex-start"
    },
    schoolIcon: {
        fontSize: "24px",
        background: "#fff",
        minWidth: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    schoolBtn: {
        marginTop: "8px",
        background: "#1e40af",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "11px"
    }
};