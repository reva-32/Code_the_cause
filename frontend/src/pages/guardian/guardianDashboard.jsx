import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GuardianDashboard() {
  const navigate = useNavigate();

  // Data States
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem("students")) || []);
  const [visitors, setVisitors] = useState(() => JSON.parse(localStorage.getItem("visitors")) || []);
  
  // UI States
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", disability: "" });

  // Form States
  const [studentForm, setStudentForm] = useState({ name: "", disability: "none" });
  const [visitorForm, setVisitorForm] = useState({ name: "", phone: "", purpose: "" });

  /* ================= HANDLERS ================= */

  const handleLogout = () => navigate("/");

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return alert("Enter student name");
    
    const newStudent = {
      name: studentForm.name.trim(),
      disability: studentForm.disability,
      levels: { maths: "Class 1", science: "Class 1" },
      completedLessons: [],
      scores: { maths: 0, science: 0 },
    };

    const updated = [...students, newStudent];
    saveStudents(updated);
    setStudentForm({ name: "", disability: "none" });
    setShowStudentForm(false);
  };

  const deleteStudent = (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      const updated = students.filter(s => s.name !== name);
      saveStudents(updated);
    }
  };

  const startEdit = (student) => {
    setEditingId(student.name);
    setEditForm({ name: student.name, disability: student.disability });
  };

  const saveEdit = (oldName) => {
    const updated = students.map(s => 
      s.name === oldName ? { ...s, name: editForm.name, disability: editForm.disability } : s
    );
    saveStudents(updated);
    setEditingId(null);
  };

  const saveStudents = (newArr) => {
    setStudents(newArr);
    localStorage.setItem("students", JSON.stringify(newArr));
  };

  const handleAddVisitor = (e) => {
    e.preventDefault();
    if (!visitorForm.name || !visitorForm.phone) return alert("Fields missing");
    const entry = { ...visitorForm, time: new Date().toLocaleString() };
    const updated = [entry, ...visitors];
    setVisitors(updated);
    localStorage.setItem("visitors", JSON.stringify(updated));
    setVisitorForm({ name: "", phone: "", purpose: "" });
  };

  // CSV DOWNLOAD LOGIC: STUDENTS
  const handleExportStudents = () => {
    if (students.length === 0) return alert("No student data to export");
    
    const headers = ["Student Name", "Disability", "Maths Level", "Science Level", "Maths Score", "Science Score"];
    const rows = students.map(s => 
      `"${s.name}","${s.disability}","${s.levels?.maths || ""}","${s.levels?.science || ""}","${s.scores?.maths || 0}","${s.scores?.science || 0}"`
    );
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `student_directory_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV DOWNLOAD LOGIC: VISITORS
  const handleExportVisitors = () => {
    if (visitors.length === 0) return alert("No visitor data to export");
    
    const headers = ["Name", "Phone", "Purpose", "Date/Time"];
    const rows = visitors.map(v => `"${v.name}","${v.phone}","${v.purpose || ""}","${v.time}"`);
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `visitor_logs_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* HEADER SECTION */}
      <div style={styles.sideHeader}>
        <div>
          <h1 style={styles.mainTitle}>Guardian Dashboard</h1>
          <p style={styles.subtitle}>Management & Oversight Portal</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout </button>
      </div>

      <div style={styles.grid}>
        
        {/* LEFT COLUMN: STUDENTS */}
        <section style={styles.column}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Students</h2>
            <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleExportStudents} style={styles.exportBtn}>Export Students 📥</button>
                <input 
                  style={styles.searchInput} 
                  placeholder="🔍 Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>
          </div>

          <button 
            style={{...styles.addBtn, background: showStudentForm ? "#991b1b" : "#065f46"}} 
            onClick={() => setShowStudentForm(!showStudentForm)}
          >
            {showStudentForm ? "Cancel" : "＋ Register Student"}
          </button>

          {showStudentForm && (
            <div style={styles.formCard}>
              <form onSubmit={handleAddStudent} style={styles.form}>
                <input 
                  style={styles.input} 
                  placeholder="Full Name" 
                  value={studentForm.name}
                  onChange={e => setStudentForm({...studentForm, name: e.target.value})} 
                />
                <select 
                  style={styles.input} 
                  value={studentForm.disability}
                  onChange={e => setStudentForm({...studentForm, disability: e.target.value})}
                >
                  <option value="none">Standard Mode</option>
                  <option value="blind">Blind</option>
                  <option value="deaf">Deaf</option>
                  <option value="adhd">ADHD</option>
                </select>
                <button type="submit" style={styles.saveBtn}>Confirm Registration</button>
              </form>
            </div>
          )}

          <div style={styles.listContainer}>
            {filteredStudents.map((s) => (
              <div key={s.name} style={styles.studentCard}>
                {editingId === s.name ? (
                  <div style={styles.editRow}>
                    <input style={styles.smallInput} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    <button onClick={() => saveEdit(s.name)} style={styles.iconBtn}>✅</button>
                    <button onClick={() => setEditingId(null)} style={styles.iconBtn}>❌</button>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.studentName}>{s.name}</h3>
                      <span style={styles.studentBadge}>{s.disability}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button onClick={() => startEdit(s)} style={styles.actionLink}>Edit</button>
                      <button onClick={() => deleteStudent(s.name)} style={styles.deleteLink}>Delete</button>
                      <button style={styles.viewBtn} onClick={() => navigate(`/guardian/student/${encodeURIComponent(s.name)}`)}>Reports 📊</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: VISITORS */}
        <section style={styles.column}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Visitor Log</h2>
            <button onClick={handleExportVisitors} style={styles.exportBtn}>Export CSV 📥</button>
          </div>

          <div style={styles.formCard}>
            <form onSubmit={handleAddVisitor} style={styles.visitorInlineForm}>
              <input
                style={styles.smallInput}
                placeholder="Visitor Name"
                value={visitorForm.name}
                onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
              />
              <input
                style={styles.smallInput}
                placeholder="Phone Number"
                value={visitorForm.phone}
                onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
              />
              <button type="submit" style={styles.saveBtn}>Check-In Visitor</button>
            </form>
          </div>

          <div style={styles.visitorList}>
            {visitors.length === 0 ? <p style={styles.emptyText}>No visitors recorded today.</p> : 
              visitors.map((v, i) => (
                <div key={i} style={styles.visitorCard}>
                  <div style={styles.visitorInfo}>
                    <strong>{v.name}</strong>
                    <span style={styles.visitorTime}>{v.time.split(',')[1]}</span>
                  </div>
                  <div style={styles.visitorSub}>📞 {v.phone}</div>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", fontFamily: "sans-serif" },
  sideHeader: { display: "flex", justifyContent: "space-between", marginBottom: "40px", borderLeft: "6px solid #065f46", paddingLeft: "24px" },
  mainTitle: { fontSize: "36px", fontWeight: "800", color: "#064e3b", margin: 0, letterSpacing: "-0.5px" },
  subtitle: { color: "#64748b", fontSize: "16px", marginTop: "4px" },
  logoutBtn: { padding: "12px 24px", background: "#065f46", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "40px" },
  column: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "50px" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", color: "#1e293b" },
  searchInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", width: "160px", outline: "none" },
  addBtn: { color: "#fff", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "15px" },
  formCard: { background: "#fff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  visitorInlineForm: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd" },
  saveBtn: { background: "#065f46", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "700" },
  studentCard: { background: "#fff", padding: "18px", borderRadius: "15px", border: "1px solid #eee", display: "flex", alignItems: "center", marginBottom: "10px" },
  studentName: { margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: "600" },
  studentBadge: { fontSize: "11px", color: "#065f46", background: "#ecfdf5", padding: "3px 8px", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase" },
  viewBtn: { background: "#065f46", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  actionLink: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px", textDecoration: "underline" },
  deleteLink: { background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "13px", textDecoration: "underline" },
  exportBtn: { border: "1px solid #065f46", color: "#065f46", background: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700" },
  visitorList: { display: "flex", flexDirection: "column", gap: "10px" },
  visitorCard: { padding: "15px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" },
  visitorInfo: { display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600" },
  visitorTime: { fontSize: "11px", color: "#94a3b8" },
  visitorSub: { fontSize: "12px", color: "#64748b", marginTop: "5px" },
  emptyText: { color: "#94a3b8", fontSize: "13px", textAlign: "center", marginTop: "20px" },
  smallInput: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }
};