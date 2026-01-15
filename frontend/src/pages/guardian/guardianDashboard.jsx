import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentAlertStatus } from "../../utils/healthStorage";

export default function GuardianDashboard() {
  const navigate = useNavigate();

  /* ================= WELCOME MODAL LOGIC ================= */
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("hasSeenWelcome")) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  /* ================= VACCINE CALCULATION ================= */
  const getVaccineAlert = (student) => {
    if (!student || !student.dob) return { active: false };

    const birthDate = new Date(student.dob);
    const today = new Date();
    const diffTime = Math.abs(today - birthDate);
    const currentDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const milestones = [
      { days: 0, key: "BCG", label: "Due: BCG" },
      { days: 42, key: "Penta-1", label: "Due: Penta-1" },
      { days: 70, key: "Penta-2", label: "Due: Penta-2" },
      { days: 98, key: "Penta-3", label: "Due: Penta-3" },
      { days: 274, key: "MR-1", label: "Due: MR-1" },
      { days: 487, key: "DPT-B1", label: "Due: DPT Booster 1" },
      { days: 1826, key: "DPT-B2", label: "Due: DPT Booster 2 (5yr)" },
      { days: 3652, key: "Td", label: "Due: Td Booster (10yr)" },
      { days: 5844, key: "Td", label: "Due: Td Booster (16yr)" }
    ];

    const alertWindow = 15; 

    for (let m of milestones) {
      const isInRange = currentDays >= (m.days - alertWindow) && currentDays <= (m.days + 30);
      if (isInRange) {
        const record = student.health?.vaccinationRecord || {};
        const isDone = record[m.key] === true;
        if (!isDone) return { active: true, label: m.label };
      }
    }
    return { active: false };
  };

  /* ================= DATA STATES ================= */
  const [students, setStudents] = useState(() => {
    return JSON.parse(localStorage.getItem("students")) || [];
  });

  const [visitors, setVisitors] = useState(
    () => JSON.parse(localStorage.getItem("visitors")) || []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [vitalsUpdate, setVitalsUpdate] = useState({ name: "", h: "", w: "" });

  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorID, setVisitorID] = useState("");
  const [visitorPurpose, setVisitorPurpose] = useState("");

  /* ================= HELPERS & SORTING ================= */
  const checkPhysicalStatus = (student) => {
    if (!student?.health?.lastPhysicalUpdate) return "MISSING";
    const last = new Date(student.health.lastPhysicalUpdate);
    const months = (new Date().getFullYear() - last.getFullYear()) * 12 + (new Date().getMonth() - last.getMonth());
    return months >= 3 ? "OVERDUE" : "OK";
  };

  const processedStudents = useMemo(() => {
    let list = students.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return list.sort((a, b) => {
      const getScore = (student) => {
        let score = 0;
        if (getStudentAlertStatus(student.name).level === 'critical') score += 100;
        if (getVaccineAlert(student).active) score += 50;
        if (checkPhysicalStatus(student) !== "OK") score += 10;
        return score;
      };
      return getScore(b) - getScore(a);
    });
  }, [students, searchQuery]);

  const maskID = (id) => (!id || id === "N/A" ? "N/A" : `XXXX-XXXX-${id.slice(-4)}`);

  /* ================= ACTIONS ================= */
  const handleDeleteStudent = (name) => {
    const guardians = JSON.parse(localStorage.getItem("guardians")) || [];
    const current = JSON.parse(localStorage.getItem("guardianLoggedIn"));
    const account = guardians.find((g) => g.email === current?.email);
    const savedPassword = account ? account.password : "admin"; 

    const input = prompt(`Enter password to delete ${name}:`);
    if (input === savedPassword) {
      const updated = students.filter((s) => s.name !== name);
      setStudents(updated);
      localStorage.setItem("students", JSON.stringify(updated));
    } else if (input !== null) {
      alert("Incorrect password");
    }
  };

  const handleUpdateVitals = (name) => {
    if (!vitalsUpdate.h || !vitalsUpdate.w) return alert("Enter height and weight");
    const updated = students.map((s) =>
      s.name === name ? {
        ...s,
        health: {
          ...(s.health || {}),
          height: vitalsUpdate.h,
          weight: vitalsUpdate.w,
          lastPhysicalUpdate: new Date().toISOString(),
        },
      } : s
    );
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));
    setVitalsUpdate({ name: "", h: "", w: "" });
    alert("Vitals updated successfully!");
  };

  /* ================= EXPORTS ================= */
  const downloadCSV = (content, fileName) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const handleExportAllStudents = () => {
    const headers = ["Full Name", "Age", "Birth Date", "Disability", "Height", "Weight"];
    const rows = students.map(s => [`"${s.name}"`, s.age, s.dob, `"${s.disability}"`, s.health?.height || "N/A", s.health?.weight || "N/A"]);
    downloadCSV([headers.join(","), ...rows.map(r => r.join(","))].join("\n"), "Student_List.csv");
  };

  const handleExportVisitorLogs = () => {
    const headers = ["Name", "Phone", "Purpose", "In", "Out"];
    const rows = visitors.map(v => [`"${v.name}"`, `"${v.phone}"`, `"${v.purpose}"`, `"${v.time}"`, `"${v.exitTime || "Inside"}"`]);
    downloadCSV([headers.join(","), ...rows.map(r => r.join(","))].join("\n"), "Visitor_Logs.csv");
  };

  /* ================= VISITORS ================= */
  const handleVisitorCheckIn = (e) => {
    e.preventDefault();
    if (!visitorName || !visitorPurpose) return alert("Name & Purpose required");
    const newVisitor = {
      id: Date.now(),
      name: visitorName,
      phone: visitorPhone || "N/A",
      idNum: visitorID || "N/A",
      purpose: visitorPurpose,
      time: new Date().toLocaleTimeString(),
      entryTime: new Date().toISOString(),
      exitTime: null,
    };
    const updated = [newVisitor, ...visitors];
    setVisitors(updated);
    localStorage.setItem("visitors", JSON.stringify(updated));
    setVisitorName(""); setVisitorPhone(""); setVisitorID(""); setVisitorPurpose("");
  };

  const handleVisitorExit = (id) => {
    const updated = visitors.map((v) =>
      v.id === id ? { ...v, exitTime: new Date().toLocaleTimeString() } : v
    );
    setVisitors(updated);
    localStorage.setItem("visitors", JSON.stringify(updated));
  };

  const filteredVisitors = visitors.filter(v => 
    v.name?.toLowerCase().includes(visitorSearch.toLowerCase()) || v.phone?.includes(visitorSearch)
  );

  return (
    <div style={styles.container}>
      {showWelcome && (
        <div style={styles.overlay}>
          <div style={styles.welcomeModal}>
            <h2 style={{ color: "#065f46", marginTop: 0, fontSize: "24px" }}>Welcome, Guardian 👋</h2>
            <p style={{ fontSize: "16px", lineHeight: "1.5" }}>Manage health records and monitor visitor logs effectively.</p>
            <button onClick={closeWelcome} style={styles.welcomeBtn}>Start Now</button>
          </div>
        </div>
      )}

      <div style={styles.sideHeader}>
        <div>
          <h1 style={styles.mainTitle}>Guardian Dashboard</h1>
          <p style={styles.subtitle}>Real-time Health & Security Monitoring</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* ADDED GUIDE BUTTON */}
          <button 
            style={styles.guideBtn} 
            onClick={() => navigate("/guardian/instructions")}
          >
            📖 Usage Guide
          </button>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.column}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Students & Health</h2>
            <input style={styles.searchInput} placeholder="🔍 Search name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button style={{ ...styles.addBtn, background: "#065f46" }} onClick={() => navigate("/guardian/add-student")}>＋ Register Student Profile</button>

          <div style={styles.listContainer}>
            {processedStudents.map((s) => {
              const healthStatus = checkPhysicalStatus(s);
              const vacAlert = getVaccineAlert(s);
              const mentalAlert = getStudentAlertStatus(s.name);

              return (
                <div key={s.name} style={{ ...styles.studentCardContainer, borderLeft: mentalAlert.level === 'critical' ? '6px solid #ef4444' : '6px solid #065f46' }}>
                  <div style={styles.studentCard}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h3 style={styles.studentName}>{s.name} <small style={{ fontSize: "14px" }}>({s.age}y)</small></h3>
                        {mentalAlert.level === 'critical' && <span style={styles.alertTagCritical}>🧠 Mental Alert</span>}
                        {vacAlert.active && <span style={styles.alertTagVaccine}>💉 {vacAlert.label}</span>}
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <span style={styles.studentBadge}>{s.disability}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ ...styles.viewBtn, background: "#065f46" }} onClick={() => navigate(`/guardian/medical-profile/${encodeURIComponent(s.name)}`)}>Profile</button>
                      <button style={{ ...styles.viewBtn, background: "#1e293b" }} onClick={() => navigate(`/guardian/student/${encodeURIComponent(s.name)}`)}>Reports</button>
                      <button style={{ ...styles.viewBtn, background: "#ef4444" }} onClick={() => handleDeleteStudent(s.name)}>Delete</button>
                    </div>
                  </div>

                  {healthStatus !== "OK" && (
                    <div style={healthStatus === "MISSING" ? styles.missingAlert : styles.overdueAlert}>
                      <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "#9a3412" }}>
                        {healthStatus === "MISSING" ? "⚠️ Update Vitals" : "⚠️ Vitals Update Overdue"}
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input placeholder="cm" style={styles.vitalsInput} type="number" onChange={(e) => setVitalsUpdate({ ...vitalsUpdate, h: e.target.value })} />
                        <input placeholder="kg" style={styles.vitalsInput} type="number" onChange={(e) => setVitalsUpdate({ ...vitalsUpdate, w: e.target.value })} />
                        <button style={styles.saveVitalsBtn} onClick={() => handleUpdateVitals(s.name)}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section style={styles.column}>
          <h2 style={styles.sectionTitle}>Data Management</h2>
          <div style={styles.formCard}>
            <button onClick={handleExportAllStudents} style={{ ...styles.saveBtn, background: "#065f46", width: "100%", marginBottom: "10px" }}>Download Full List 📂</button>
            <button onClick={handleExportVisitorLogs} style={{ ...styles.saveBtn, background: "#1e293b", width: "100%" }}>Export Visitors 📥</button>
          </div>

          <h2 style={styles.sectionTitle}>Academic Center</h2>
          <div style={styles.formCard}>
            <button
              onClick={() => navigate("/guardian/exam-center")}
              style={{ ...styles.saveBtn, background: "#10b981", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              📝 Final Exam Center
            </button>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", textAlign: "center" }}>
              Download question papers & upload answer sheets for promotion.
            </p>
          </div>

          <h2 style={styles.sectionTitle}>Visitor Check-In</h2>
          <div style={styles.formCard}>
            <form onSubmit={handleVisitorCheckIn}>
              <input style={styles.visitorInput} placeholder="Visitor Name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
              <input style={styles.visitorInput} placeholder="Phone Number" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
              <input style={styles.visitorInput} placeholder="Gov ID" value={visitorID} onChange={(e) => setVisitorID(e.target.value)} />
              <select style={{ ...styles.visitorInput, height: "45px" }} value={visitorPurpose} onChange={(e) => setVisitorPurpose(e.target.value)}>
                <option value="">Select Purpose</option>
                <option value="Medical">Medical Checkup</option>
                <option value="Audit">Government Audit</option>
                <option value="Guardian">Guardian Visit</option>
              </select>
              <button type="submit" style={{ ...styles.saveBtn, width: "100%", background: "#065f46" }}>Log Visitor</button>
            </form>
          </div>

          <h2 style={styles.sectionTitle}>Recent Visitors</h2>
          <input
            style={{ ...styles.visitorInput, border: "2px solid #065f46" }}
            placeholder="🔍 Search Visitors..."
            value={visitorSearch}
            onChange={(e) => setVisitorSearch(e.target.value)}
          />

          <div style={styles.listContainer}>
            {filteredVisitors.slice(0, 10).map((v) => (
              <div key={v.id} style={styles.visitorCard}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{v.name} ({v.purpose})</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>In: {v.time} | ID: {maskID(v.idNum)}</p>
                  {v.exitTime && <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#ef4444", fontWeight: "bold" }}>Out: {v.exitTime}</p>}
                </div>
                {!v.exitTime && (
                  <button onClick={() => handleVisitorExit(v.id)} style={styles.exitBtn}>Exit 🚪</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= UPDATED STYLES (Reduced Font Sizes) ================= */
const styles = {
  container: { maxWidth: "1250px", margin: "0 auto", padding: "30px", fontFamily: "Inter, sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  welcomeModal: { background: "#fff", padding: "40px", borderRadius: "16px", maxWidth: "450px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  welcomeBtn: { width: "100%", padding: "14px", background: "#065f46", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px" },
  sideHeader: { display: "flex", justifyContent: "space-between", marginBottom: "30px", borderLeft: "6px solid #065f46", paddingLeft: "20px" },
  mainTitle: { fontSize: "28px", fontWeight: "800", color: "#064e3b", margin: 0 },
  subtitle: { color: "#64748b", margin: "4px 0 0 0", fontSize: "16px" },
  guideBtn: { padding: "10px 18px", background: "#f1f5f9", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  logoutBtn: { padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "35px" },
  column: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", color: "#1e293b" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  searchInput: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", width: "200px" },
  addBtn: { color: "#fff", border: "none", padding: "14px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px" },
  studentCardContainer: { borderRadius: "12px", background: "#fff", marginBottom: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #eee" },
  studentCard: { padding: "15px 20px", display: "flex", alignItems: "center" },
  studentName: { margin: 0, fontSize: "18px", fontWeight: "700" },
  studentBadge: { fontSize: "12px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "5px", fontWeight: "600", color: "#475569" },
  alertTagCritical: { fontSize: "11px", background: "#fef2f2", color: "#dc2626", padding: "3px 10px", borderRadius: "10px", border: "1px solid #fca5a5", fontWeight: "700" },
  alertTagVaccine: { fontSize: "11px", background: "#fffbeb", color: "#b45309", padding: "3px 10px", borderRadius: "10px", border: "1px solid #fcd34d", fontWeight: "700" },
  viewBtn: { color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  missingAlert: { background: "#fff7ed", padding: "12px 20px", borderTop: "1px solid #fed7aa" },
  overdueAlert: { background: "#fef2f2", padding: "12px 20px", borderTop: "1px solid #fecaca" },
  vitalsInput: { width: "70px", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
  saveVitalsBtn: { background: "#065f46", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  formCard: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  saveBtn: { color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "15px" },
  visitorInput: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "15px" },
  visitorCard: { background: "#f8fafc", padding: "12px 15px", borderRadius: "10px", display: "flex", alignItems: "center", marginBottom: "10px", border: "1px solid #e2e8f0" },
  exitBtn: { background: "#fff", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }
};