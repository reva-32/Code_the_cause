import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function AdminContentUpload() {
  const availableAudios = [
    "class1-addition.mp3", 
    "class1-goodhabits.mp3", 
    "class2-multiplication.mp3", 
    "class2-watercycle.mp3", 
    "class3-living-nonliving.mp3"
  ];
  
  const availableVideos = ["math_basics.mp4", "science_intro.mp4"];

  const [form, setForm] = useState({ 
    title: "", 
    subject: "Maths", 
    classLevel: "1", 
    videoFile: "", // For local .mp4
    videoId: "",   // For YouTube IDs
    audioFile: "", 
    easyVersion: false 
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Check if at least one video source is provided
    if (!form.videoId && !form.videoFile) {
      alert("Please enter a YouTube ID OR select a Local Video file.");
      return;
    }

    const existingLessons = JSON.parse(localStorage.getItem("custom_lessons")) || [];
    const newLesson = { 
      ...form, 
      id: Date.now(), 
      createdAt: new Date().toISOString() 
    };

    localStorage.setItem("custom_lessons", JSON.stringify([...existingLessons, newLesson]));
    alert("Lesson registered successfully! ✅");

    // Reset form after submission
    setForm({ 
      title: "", 
      subject: "Maths", 
      classLevel: "1", 
      videoFile: "", 
      videoId: "", 
      audioFile: "", 
      easyVersion: false 
    });
  };

  const inputStyle = { 
    width: "100%", 
    padding: "12px", 
    marginBottom: "15px", 
    borderRadius: "8px", 
    border: "1px solid #d1fae5", 
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ color: "#1b4332", marginBottom: "20px" }}>Admin Content Upload</h2>
        
        <div style={{ 
          background: "white", 
          padding: "30px", 
          borderRadius: "20px", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)", 
          maxWidth: "800px" 
        }}>
          <h3 style={{ marginBottom: "20px", color: "#2d6a4f" }}>Register Lesson</h3>
          
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Lesson Title *</label>
            <input 
              style={inputStyle} 
              type="text" 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})} 
              placeholder="e.g. Addition Basics" 
              required 
            />

            {/* Audio Selection */}
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Audio Resource *</label>
            <select 
              style={inputStyle} 
              value={form.audioFile} 
              onChange={(e) => setForm({...form, audioFile: e.target.value})}
              required
            >
              <option value="">-- Select Audio --</option>
              {availableAudios.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <div style={{ 
              margin: "20px 0", 
              padding: "20px", 
              border: "2px dashed #d1fae5", 
              borderRadius: "15px" 
            }}>
              <h4 style={{ marginTop: 0, color: "#2d6a4f" }}>Video Selection (Choose One)</h4>
              
              {/* YouTube Option */}
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#b91c1c" }}>YouTube Video ID</label>
              <input 
                style={{ ...inputStyle, border: "1px solid #fca5a5" }} 
                type="text" 
                value={form.videoId} 
                onChange={(e) => setForm({...form, videoId: e.target.value, videoFile: ""})} 
                placeholder="Paste ID only, e.g., dQw4w9WgXcQ" 
              />
              <p style={{ fontSize: "12px", color: "#666", marginTop: "-10px" }}>
                Find this in the URL after <b>v=</b>
              </p>

              <div style={{ textAlign: "center", margin: "10px 0", fontWeight: "bold", color: "#aaa" }}>— OR —</div>

              {/* Local File Option */}
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Local Video File</label>
              <select 
                style={inputStyle} 
                value={form.videoFile} 
                onChange={(e) => setForm({...form, videoFile: e.target.value, videoId: ""})}
              >
                <option value="">-- Select Local Video --</option>
                {availableVideos.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Subject and Class Row */}
            <div style={{ display: "flex", gap: "20px" }}>
               <div style={{ flex: 1 }}>
                 <label style={{ display: "block", fontWeight: "600" }}>Subject</label>
                 <select style={inputStyle} value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})}>
                   <option>Maths</option>
                   <option>Science</option>
                 </select>
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ display: "block", fontWeight: "600" }}>Class</label>
                 <select style={inputStyle} value={form.classLevel} onChange={(e) => setForm({...form, classLevel: e.target.value})}>
                   {[1,2,3,4,5].map(n => <option key={n} value={n}>Class {n}</option>)}
                 </select>
               </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{ 
                width: "100%", 
                padding: "15px", 
                background: "#1b4332", 
                color: "white", 
                border: "none", 
                borderRadius: "10px", 
                fontWeight: "bold", 
                cursor: "pointer", 
                fontSize: "16px",
                marginTop: "10px" 
              }}
            >
              Register Lesson
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}