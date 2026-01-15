import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

export default function AdminContentUpload() {
  const [students, setStudents] = useState([]);

  // ✅ NEW STATE FOR NOTES
  const [notesFile, setNotesFile] = useState(null);

  const availableAudios = [
    "class1-addition.mp3", "class1-goodhabits.mp3", "class2-multiplication.mp3",
    "class2-watercycle.mp3", "class3-living-nonliving.mp3"
  ];
  const availableVideos = ["math_basics.mp4", "science_intro.mp4"];

  const [form, setForm] = useState({
    title: "",
    subject: "Maths",
    classLevel: "1",
    videoFile: "",
    videoId: "",
    audioFile: "",
    easyVersion: false,
    targetStudentId: ""
  });

  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem("students")) || [];
    setStudents(savedStudents);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.videoId && !form.videoFile) {
      alert("Please enter a YouTube ID OR select a Local Video file.");
      return;
    }

    const existingLessons = JSON.parse(localStorage.getItem("custom_lessons")) || [];

    // ✅ MODIFIED: Added notesUrl to the newLesson object
    const newLesson = {
      ...form,
      id: Date.now(),
      isPersonalized: !!form.targetStudentId,
      createdAt: new Date().toISOString(),
      notesUrl: notesFile ? notesFile.name : null // Saving the filename reference
    };

    localStorage.setItem("custom_lessons", JSON.stringify([...existingLessons, newLesson]));
    alert(form.targetStudentId ? "Personalized intervention with notes registered! ✅" : "General lesson with notes registered! ✅");

    // Reset form
    setForm({
      title: "",
      subject: "Maths",
      classLevel: "1",
      videoFile: "",
      videoId: "",
      audioFile: "",
      easyVersion: false,
      targetStudentId: ""
    });
    // ✅ RESET NOTES FILE
    setNotesFile(null);
    document.getElementById("notesInput").value = "";
  };

  const inputStyle = { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #d1fae5", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ color: "#1b4332", marginBottom: "20px" }}>Admin Content Management</h2>

        <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", maxWidth: "800px" }}>
          <form onSubmit={handleSubmit}>

            {/* --- Lesson Title --- */}
            <label style={{ fontWeight: "600" }}>Lesson Title *</label>
            <input
              style={inputStyle}
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter lesson title"
              required
            />

            {/* --- Class & Subject Dropdowns Row --- */}
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "600" }}>Class / Grade *</label>
                <select
                  style={inputStyle}
                  value={form.classLevel}
                  onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                >
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: "600" }}>Subject *</label>
                <select
                  style={inputStyle}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="Maths">Maths</option>
                  <option value="Science">Science</option>
                </select>
              </div>
            </div>

            {/* --- PERSONALIZATION SECTION --- */}
            <div style={{ padding: "15px", background: "#fffbeb", borderRadius: "12px", border: "1px solid #fcd34b", marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold", color: "#92400e" }}>Target Specific Student (Intervention)</label>
              <select
                style={inputStyle}
                value={form.targetStudentId}
                onChange={(e) => setForm({ ...form, targetStudentId: e.target.value })}
              >
                <option value="">-- Apply to All Students --</option>
                {students.map(s => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
              </select>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  checked={form.easyVersion}
                  onChange={(e) => setForm({ ...form, easyVersion: e.target.checked })}
                />
                <label style={{ fontWeight: "600" }}>Enable Easy Version (0.8x Speed & Simpler Test)</label>
              </div>
            </div>

            {/* --- Audio Selection --- */}
            <label style={{ fontWeight: "600" }}>Audio Resource *</label>
            <select
              style={inputStyle}
              value={form.audioFile}
              onChange={(e) => setForm({ ...form, audioFile: e.target.value })}
              required
            >
              <option value="">-- Select Audio --</option>
              {availableAudios.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            {/* ✅ NEW: Lesson Notes (PDF) Upload Section */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "600" }}>Lesson Notes (Optional PDF)</label>
              <input
                id="notesInput"
                type="file"
                accept=".pdf"
                style={{ ...inputStyle, border: "1px solid #94a3b8", background: "#f8fafc" }}
                onChange={(e) => setNotesFile(e.target.files[0])}
              />
            </div>

            {/* --- Video Selection Section --- */}
            <div style={{ margin: "20px 0", padding: "20px", border: "2px dashed #d1fae5", borderRadius: "15px" }}>
              <label style={{ fontWeight: "600", color: "#b91c1c" }}>YouTube Video ID</label>
              <input
                style={{ ...inputStyle, border: "1px solid #fca5a5" }}
                type="text"
                value={form.videoId}
                onChange={(e) => setForm({ ...form, videoId: e.target.value, videoFile: "" })}
                placeholder="e.g. dQw4w9WgXcQ"
              />

              <div style={{ textAlign: "center", margin: "10px 0", fontWeight: "bold", color: "#aaa" }}>— OR —</div>

              <label style={{ fontWeight: "600" }}>Local Video File</label>
              <select
                style={inputStyle}
                value={form.videoFile}
                onChange={(e) => setForm({ ...form, videoFile: e.target.value, videoId: "" })}
              >
                <option value="">-- Select Local Video --</option>
                {availableVideos.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <button
              type="submit"
              style={{ width: "100%", padding: "15px", background: "#1b4332", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
            >
              Register Lesson
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}