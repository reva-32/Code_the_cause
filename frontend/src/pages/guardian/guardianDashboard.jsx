import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importing the logic we added to healthStorage
import { getStudentAlertStatus } from "../../utils/healthStorage";

export default function GuardianDashboard() {
  const navigate = useNavigate();

  // Data States - Enhanced with Alert Sorting
  const [students, setStudents] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("students")) || [];

    // THE BRAIN: Sort students by alert severity (Critical > Warning > None)
    return saved.sort((a, b) => {
      const aLevel = getStudentAlertStatus(a.name).level;
      const bLevel = getStudentAlertStatus(b.name).level;
      const score = { critical: 2, warning: 1, none: 0 };
      return score[bLevel] - score[aLevel];
    });
  });

  const [visitors, setVisitors] = useState(() => JSON.parse(localStorage.getItem("visitors")) || []);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [vitalsUpdate, setVitalsUpdate] = useState({ name: "", h: "", w: "" });

  // Visitor Form States
  const [visitorName, setVisitorName] = useState("");
  const [visitorPurpose, setVisitorPurpose] = useState("");

  /* ================= VACCINE LOGIC (NIS INDIA) ================= */
  const getUpcomingVaccine = (dob, vaccinationRecord = {}) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    const schedule = [
      { name: "BCG", days: 0 }, { name: "Penta-1", days: 42 },
      { name: "Penta-2", days: 70 }, { name: "Penta-3", days: 98 },
      { name: "MR-1", days: 270 }, { name: "DPT-B1", days: 480 },
      { name: "DPT-B2", days: 1825 }, { name: "Td", days: 3650 }
    ];
    for (let v of schedule) {
      const dueDate = new Date(birthDate);
      dueDate.setDate(birthDate.getDate() + v.days);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 5 && diffDays >= -30 && !vaccinationRecord[v.name]) {
        return { name: v.name, days: diffDays };
      }
    }
    return null;
  };

  /* ================= EXPORT LOGIC ================= */
  const downloadCSV = (content, fileName) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMedicalData = () => {
    if (students.length === 0) return alert("No data to export.");
    const headers = ["Name", "Age", "DOB", "Disability", "Chronic Illness", "Height", "Weight", "Last Update"];
    const rows = students.map(s => [
      `"${s.name}"`, s.age, s.dob, `"${s.disability}"`, `"${s.health?.chronicIllness || "None"}"`,
      s.health?.height || "N/A", s.health?.weight || "N/A", s.health?.lastPhysicalUpdate || "N/A"
    ].join(","));
    downloadCSV([headers.join(","), ...rows].join("\n"), `Medical_Data_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportVisitorLogs = () => {
    if (visitors.length === 0) return alert("No logs to export.");
    const headers = ["Visitor Name", "Purpose", "Time"];
    const rows = visitors.map(v => [`"${v.name}"`, `"${v.purpose}"`, `"${v.time}"`].join(","));
    downloadCSV([headers.join(","), ...rows].join("\n"), `Visitor_Logs_${new Date().toISOString().split('T')[0]}.csv`);
  };

  /* ================= HANDLERS ================= */
  const checkPhysicalStatus = (student) => {
    if (!student?.health?.lastPhysicalUpdate) return "MISSING";
    const lastDate = new Date(student.health.lastPhysicalUpdate);
    const diffMonths = (new Date().getFullYear() - lastDate.getFullYear()) * 12 + (new Date().getMonth() - lastDate.getMonth());
    return diffMonths >= 3 ? "OVERDUE" : "OK";
  };

  const handleUpdateVitals = (studentName) => {
    if (!vitalsUpdate.h || !vitalsUpdate.w) return alert("Please enter height & weight");
    const updated = students.map(s => {
      if (s.name === studentName) {
        return {
          ...s,
          health: { ...(s.health || {}), height: parseFloat(vitalsUpdate.h), weight: parseFloat(vitalsUpdate.w), lastPhysicalUpdate: new Date().toISOString() }
        };
      }
      return s;
    });
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));
    setVitalsUpdate({ name: "", h: "", w: "" });
    alert("Vitals saved!");
  };

  const handleVisitorCheckIn = (e) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPurpose.trim()) return alert("Fill all fields");
    const newV = { id: Date.now(), name: visitorName, purpose: visitorPurpose, time: new Date().toLocaleTimeString() };
    const updatedV = [newV, ...visitors].slice(0, 5);
    setVisitors(updatedV);
    localStorage.setItem("visitors", JSON.stringify(updatedV));
    setVisitorName(""); setVisitorPurpose("");
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={styles.container}>
      <div style={styles.sideHeader}>
        <div>
          <h1 style={styles.mainTitle}>Guardian Dashboard</h1>
          <p style={styles.subtitle}>Management & Oversight Portal</p>
        </div>
        <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
      </div>

      <div style={styles.grid}>
        {/* LEFT COLUMN: STUDENTS */}
        <section style={styles.column}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Students & Health</h2>
            <input style={styles.searchInput} placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <button style={{ ...styles.addBtn, background: "#065f46" }} onClick={() => navigate("/guardian/add-student")}>
            ＋ Register New Student Profile
          </button>

          <div style={styles.listContainer}>
            {filteredStudents.map((s) => {
              const healthStatus = checkPhysicalStatus(s);
              const vaxAlert = getUpcomingVaccine(s.dob, s.health?.vaccinationRecord);

              // GET MENTAL HEALTH ALERT STATUS
              const mhAlert = getStudentAlertStatus(s.name);

              return (
                <div key={s.name} style={{
                  ...styles.studentCardContainer,
                  // Dynamic Border color based on Mental Health Alert
                  borderLeft: mhAlert.level === 'critical' ? '6px solid #ef4444' :
                    mhAlert.level === 'warning' ? '6px solid #f97316' : '6px solid #065f46'
                }}>
                  <div style={styles.studentCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.studentName}>
                        {s.name} <small style={{ color: "#64748b" }}>({s.age}y)</small>

                        {/* MENTAL HEALTH ALERT BADGES */}
                        {mhAlert.level !== "none" && (
                          <span style={mhAlert.level === 'critical' ? styles.criticalBadge : styles.warningBadge}>
                            {mhAlert.level === 'critical' ? '🚨' : '⚠️'} {mhAlert.reason}
                          </span>
                        )}

                        {/* VACCINE ALERT BADGE */}
                        {vaxAlert && (
                          <span style={styles.vaxAlertBadge}>
                            💉 {vaxAlert.name} {vaxAlert.days <= 0 ? "DUE" : `in ${vaxAlert.days}d`}
                          </span>
                        )}
                      </h3>
                      <span style={styles.studentBadge}>{s.disability}</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button style={{ ...styles.viewBtn, background: "#065f46" }} onClick={() => navigate(`/guardian/medical-profile/${encodeURIComponent(s.name)}`)}>
                        Medical Profile 📋
                      </button>
                      <button style={{ ...styles.viewBtn, background: "#065f46" }} onClick={() => navigate(`/guardian/student/${encodeURIComponent(s.name)}`)}>
                        Reports 📊
                      </button>
                    </div>
                  </div>

                  {/* Physical Health Alerts - Kept as per original logic */}
                  {healthStatus !== "OK" && (
                    <div style={healthStatus === "MISSING" ? styles.missingAlert : styles.overdueAlert}>
                      <p style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 5px 0" }}>
                        {healthStatus === "MISSING" ? "🚨 Initial Vitals Required" : "⚠️ Growth Check Due"}
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input placeholder="cm" style={styles.vitalsInput} type="number" onChange={(e) => setVitalsUpdate({ ...vitalsUpdate, name: s.name, h: e.target.value })} />
                        <input placeholder="kg" style={styles.vitalsInput} type="number" onChange={(e) => setVitalsUpdate({ ...vitalsUpdate, name: s.name, w: e.target.value })} />
                        <button style={styles.saveVitalsBtn} onClick={() => handleUpdateVitals(s.name)}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: DATA TOOLS & VISITORS */}
        <section style={styles.column}>
          <h2 style={styles.sectionTitle}>Data Management</h2>
          <div style={styles.formCard}>
            <button onClick={handleExportMedicalData} style={{ ...styles.saveBtn, background: "#1e293b", marginBottom: "10px", width: "100%" }}>Export Medical CSV 📥</button>
            <button onClick={handleExportVisitorLogs} style={{ ...styles.saveBtn, background: "#1e293b", width: "100%" }}>Export Visitor CSV 📥</button>
          </div>

          <h2 style={styles.sectionTitle}>Visitor Check-In</h2>
          <div style={styles.formCard}>
            <form onSubmit={handleVisitorCheckIn}>
              <input style={{ ...styles.searchInput, width: "100%", marginBottom: "10px" }} placeholder="Name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
              <select style={{ ...styles.searchInput, width: "100%", marginBottom: "10px", height: "40px" }} value={visitorPurpose} onChange={(e) => setVisitorPurpose(e.target.value)}>
                <option value="">Select Purpose</option>
                <option value="Medical">Medical</option>
                <option value="Audit">Government Audit</option>
                <option value="Guardian">Guardian Visit</option>
              </select>
              <button type="submit" style={{ ...styles.saveBtn, width: "100%", background: "#065f46" }}>Log Visitor</button>
            </form>
            <div style={{ marginTop: "15px" }}>
              <p style={styles.tinyLabel}>RECENT VISITORS:</p>
              {visitors.map(v => (
                <div key={v.id} style={styles.visitorRow}>
                  <span>{v.name}</span> <small>{v.time}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "30px", fontFamily: "Inter, sans-serif" },
  sideHeader: { display: "flex", justifyContent: "space-between", marginBottom: "30px", borderLeft: "6px solid #065f46", paddingLeft: "20px" },
  mainTitle: { fontSize: "28px", fontWeight: "800", color: "#064e3b", margin: 0 },
  subtitle: { color: "#64748b" },
  logoutBtn: { padding: "8px 16px", background: "#065f46", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px" },
  column: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  searchInput: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  addBtn: { color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  studentCardContainer: { borderRadius: "12px", overflow: "hidden", background: "#fff", marginBottom: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #eee" },
  studentCard: { padding: "15px 20px", display: "flex", alignItems: "center" },
  studentName: { margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  studentBadge: { fontSize: "10px", background: "#ecfdf5", color: "#065f46", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" },
  viewBtn: { color: "#fff", border: "none", padding: "10px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  vaxAlertBadge: { background: "#fef2f2", color: "#b91c1c", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", border: "1px solid #fecaca" },

  // NEW MENTAL HEALTH ALERTS
  criticalBadge: { background: "#fee2e2", color: "#dc2626", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", border: "1px solid #fca5a5" },
  warningBadge: { background: "#fff7ed", color: "#ea580c", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", border: "1px solid #fdba74" },

  missingAlert: { background: "#fff7ed", padding: "12px" },
  overdueAlert: { background: "#fef2f2", padding: "12px" },
  vitalsInput: { width: "60px", padding: "6px", borderRadius: "4px", border: "1px solid #ddd" },
  saveVitalsBtn: { background: "#065f46", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" },
  formCard: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" },
  saveBtn: { color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  tinyLabel: { fontSize: "10px", fontWeight: "bold", color: "#94a3b8" },
  visitorRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }
};