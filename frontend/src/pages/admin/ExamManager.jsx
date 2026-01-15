import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from "../../components/Sidebar";

export default function ExamManager() {
    const [selectedClass, setSelectedClass] = useState("Class 1");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // ✅ 1. ADD STATE HERE
    const [subject, setSubject] = useState("Maths");
    const [studentType, setStudentType] = useState("Standard");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first!");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("classLevel", selectedClass);

        // ✅ 2. ADD FORM DATA APPENDS HERE
        // (Must match the keys your Flask backend expects)
        formData.append("subject", subject);
        formData.append("studentType", studentType);

        setUploading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/admin/upload-exam", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert(response.data.message);
            setFile(null);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload exam paper.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
                <h2 style={{ color: "#1b4332", marginBottom: "5px" }}>Final Exam Management</h2>
                <p style={{ color: "#64748b", marginBottom: "25px" }}>
                    Publish subject-specific papers for standard or blind students.
                </p>

                <div style={cardStyle}>
                    <div style={{ maxWidth: "500px" }}>

                        {/* CLASS SELECTION */}
                        <div style={formGroup}>
                            <label style={labelStyle}>Target Class Level</label>
                            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={inputStyle}>
                                <option value="Class 1">Class 1</option>
                                <option value="Class 2">Class 2</option>
                                <option value="Class 3">Class 3</option>
                                <option value="Class 4">Class 4</option>
                                <option value="Class 5">Class 5</option>
                            </select>
                        </div>

                        {/* ✅ 3. ADD SUBJECT SELECTION HERE */}
                        <div style={formGroup}>
                            <label style={labelStyle}>Subject</label>
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                                <option value="Maths">Mathematics</option>
                                <option value="Science">Science</option>
                            </select>
                        </div>

                        {/* ✅ 4. ADD STUDENT GROUP SELECTION HERE */}
                        <div style={formGroup}>
                            <label style={labelStyle}>Student Group</label>
                            <select value={studentType} onChange={(e) => setStudentType(e.target.value)} style={inputStyle}>
                                <option value="Standard">Standard (Visual)</option>
                                <option value="Blind">Blind (Screen Reader Optimized)</option>
                            </select>
                        </div>

                        <div style={formGroup}>
                            <label style={labelStyle}>Select Question Paper (PDF Only)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ ...inputStyle, border: "none", padding: "10px 0" }}
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            style={{
                                ...uploadBtn,
                                background: uploading ? "#94a3b8" : "#10b981",
                            }}
                        >
                            {uploading ? "⏳ Uploading..." : "📤 Publish Exam Paper"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Styles to match VisitorLogs.jsx ---

const cardStyle = {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const formGroup = {
    marginBottom: "20px",
};

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px"
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: "15px",
    outline: "none"
};

const uploadBtn = {
    width: "100%",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "all 0.2s ease",
    marginTop: "10px"
};