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
      {/* Dynamic CSS injection for hover/active states */}
      <style>
        {`
          button:hover { filter: brightness(1.1); transform: translateY(-1px); }
          button:active { transform: translateY(1px) scale(0.98); }
          .btn-primary:hover { box-shadow: 0 4px 12px rgba(6, 95, 70, 0.2); }
          .btn-secondary:hover { box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2); }
          .card-hover:hover { border-color: #065f46 !important; box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
        `}
      </style>

      {showWelcome && (
        <div style={styles.overlay}>
          <div style={styles.welcomeModal}>
            <div style={styles.welcomeIcon}>🛡️</div>
            <h2 style={{ color: "#065f46", margin: "10px 0", fontSize: "24px" }}>Welcome, Guardian 👋</h2>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "25px" }}>Institutional Security & Health Management Dashboard.</p>
            <button onClick={closeWelcome} style={styles.welcomeBtn}>Enter System</button>
          </div>
        </div>
      )}

      <div style={styles.sideHeader}>
        <div>
          <div style={styles.badge}>SECURE ACCESS</div>
          <h1 style={styles.mainTitle}>Guardian Dashboard</h1>
          <p style={styles.subtitle}>Health Monitoring & Security Control Center</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button style={styles.guideBtn} onClick={() => navigate("/guardian/instructions")}>📖 Usage Guide</button>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.column}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Students & Health Monitoring</h2>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input style={styles.searchInput} placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <button style={styles.addBtn} className="btn-primary" onClick={() => navigate("/guardian/add-student")}>
            ＋ Register New Student Profile
          </button>

          <div style={styles.listContainer}>
            {processedStudents.map((s) => {
              const healthStatus = checkPhysicalStatus(s);
              const vacAlert = getVaccineAlert(s);
              const mentalAlert = getStudentAlertStatus(s.name);

              return (
                <div key={s.name} className="card-hover" style={{ ...styles.studentCardContainer, borderLeft: mentalAlert.level === 'critical' ? '6px solid #ef4444' : '6px solid #065f46' }}>
                  <div style={styles.studentCard}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h3 style={styles.studentName}>{s.name}</h3>
                        <span style={styles.ageBadge}>{s.age}y</span>
                        {mentalAlert.level === 'critical' && <span style={styles.alertTagCritical}>🧠 Alert</span>}
                        {vacAlert.active && <span style={styles.alertTagVaccine}>💉 {vacAlert.label}</span>}
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <span style={styles.studentBadge}>{s.disability}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ ...styles.viewBtn, background: "#ecfdf5", color: "#065f46" }} onClick={() => navigate(`/guardian/medical-profile/${encodeURIComponent(s.name)}`)}>Medical</button>
                      <button style={{ ...styles.viewBtn, background: "#f8fafc", color: "#1e293b" }} onClick={() => navigate(`/guardian/student/${encodeURIComponent(s.name)}`)}>Reports</button>
                      <button style={{ ...styles.viewBtn, background: "#fef2f2", color: "#ef4444" }} onClick={() => handleDeleteStudent(s.name)}>Delete</button>
                    </div>
                  </div>

                  {healthStatus !== "OK" && (
                    <div style={healthStatus === "MISSING" ? styles.missingAlert : styles.overdueAlert}>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#9a3412", flex: 1 }}>
                        {healthStatus === "MISSING" ? "⚠️ Vitals Record Incomplete" : "⚠️ Update Overdue"}
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
          <div style={styles.sectionSpacing}>
            <h2 style={styles.sectionTitle}>Data Management</h2>
            <div style={styles.toolGrid}>
              <button onClick={handleExportAllStudents} className="btn-primary" style={styles.exportBtnDeep}>
                <span style={{ fontSize: "20px" }}>📂</span>
                <div style={styles.exportText}>
                  <b>Student List</b>
                  <small>Export Full CSV</small>
                </div>
              </button>
              <button onClick={handleExportVisitorLogs} className="btn-secondary" style={styles.exportBtnLight}>
                <span style={{ fontSize: "20px" }}>📥</span>
                <div style={styles.exportText}>
                  <b>Visitor Logs</b>
                  <small>Export History</small>
                </div>
              </button>
            </div>
          </div>

          <div style={styles.sectionSpacing}>
            <h2 style={styles.sectionTitle}>Academic Center</h2>
            <div style={styles.formCard}>
              <button onClick={() => navigate("/guardian/exam-center")} className="btn-primary" style={styles.examBtn}>
                📝 Final Exam Center
              </button>
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "12px", textAlign: "center" }}>
                Secure access for question papers & answer sheet uploads.
              </p>
            </div>
          </div>

          <div style={styles.sectionSpacing}>
            <h2 style={styles.sectionTitle}>Visitor Check-In</h2>
            <div style={styles.formCard}>
              <form onSubmit={handleVisitorCheckIn}>
                <div style={styles.inputRow}>
                  <input style={styles.visitorInput} placeholder="Visitor Name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
                  <input style={styles.visitorInput} placeholder="Phone" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
                </div>
                <div style={styles.inputRow}>
                  <input style={styles.visitorInput} placeholder="Gov ID" value={visitorID} onChange={(e) => setVisitorID(e.target.value)} />
                  <select style={styles.visitorSelect} value={visitorPurpose} onChange={(e) => setVisitorPurpose(e.target.value)}>
                    <option value="">Select Purpose</option>
                    <option value="Medical">Medical Checkup</option>
                    <option value="Audit">Government Audit</option>
                    <option value="Guardian">Guardian Visit</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={styles.logVisitorBtn}>Authorize Entry</button>
              </form>
            </div>
          </div>

          <div style={styles.sectionSpacing}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Live Security Logs</h2>
              <input style={styles.visitorSearchInput} placeholder="🔍 Filter..." value={visitorSearch} onChange={(e) => setVisitorSearch(e.target.value)} />
            </div>
            <div style={styles.listContainer}>
              {filteredVisitors.slice(0, 5).map((v) => (
                <div key={v.id} style={styles.visitorCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <p style={styles.vName}>{v.name}</p>
                      <span style={styles.vPurposeBadge}>{v.purpose}</span>
                    </div>
                    <p style={styles.vMeta}>In: {v.time} | ID: {maskID(v.idNum)}</p>
                    {v.exitTime && <p style={styles.vExitText}>Checked Out: {v.exitTime}</p>}
                  </div>
                  {!v.exitTime && (
                    <button onClick={() => handleVisitorExit(v.id)} style={styles.exitBtn}>Exit Door</button>
                  )}
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
  container: { maxWidth: "1400px", margin: "0 auto", padding: "40px", fontFamily: "'Inter', sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" },
  overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  welcomeModal: { background: "#fff", padding: "40px", borderRadius: "28px", maxWidth: "420px", textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.3)" },
  welcomeIcon: { fontSize: "48px", marginBottom: "15px" },
  welcomeBtn: { width: "100%", padding: "16px", background: "#065f46", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease" },
  sideHeader: { display: "flex", justifyContent: "space-between", marginBottom: "50px", paddingBottom: "30px", borderBottom: "2px solid #e2e8f0" },
  badge: { display: "inline-block", backgroundColor: "#ecfdf5", color: "#059669", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", marginBottom: "12px", border: "1px solid #10b981" },
  mainTitle: { fontSize: "40px", fontWeight: "900", color: "#064e3b", margin: 0, letterSpacing: "-1.5px" },
  subtitle: { color: "#64748b", margin: "6px 0 0 0", fontSize: "18px" },
  guideBtn: { padding: "12px 24px", background: "#fff", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "all 0.2s ease" },
  logoutBtn: { padding: "12px 28px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "all 0.2s ease" },
  grid: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "60px" },
  column: { display: "flex", flexDirection: "column", gap: "30px" },
  sectionSpacing: { marginBottom: "25px" },
  sectionTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "18px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  searchContainer: { position: "relative" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
  searchInput: { padding: "14px 14px 14px 40px", borderRadius: "14px", border: "1px solid #cbd5e1", fontSize: "14px", width: "220px", outline: "none", transition: "border 0.2s" },
  addBtn: { background: "#065f46", color: "#fff", border: "none", padding: "20px", borderRadius: "18px", fontWeight: "800", cursor: "pointer", fontSize: "16px", transition: "all 0.2s ease" },
  studentCardContainer: { borderRadius: "22px", background: "#fff", marginBottom: "18px", border: "1px solid #f1f5f9", overflow: "hidden", transition: "all 0.2s ease" },
  studentCard: { padding: "24px 30px", display: "flex", alignItems: "center" },
  studentName: { margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e293b" },
  ageBadge: { fontSize: "14px", color: "#64748b", background: "#f1f5f9", padding: "4px 12px", borderRadius: "10px" },
  studentBadge: { fontSize: "11px", background: "#f0fdf4", padding: "5px 14px", borderRadius: "8px", fontWeight: "800", color: "#065f46", textTransform: "uppercase", border: "1px solid #bcf0da" },
  alertTagCritical: { fontSize: "10px", background: "#fef2f2", color: "#dc2626", padding: "4px 10px", borderRadius: "8px", fontWeight: "900", border: "1px solid #fee2e2" },
  alertTagVaccine: { fontSize: "10px", background: "#fffbeb", color: "#b45309", padding: "4px 10px", borderRadius: "8px", fontWeight: "900", border: "1px solid #fef3c7" },
  viewBtn: { border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700", transition: "all 0.2s ease" },
  missingAlert: { background: "#fffbeb", padding: "18px 30px", borderTop: "1px solid #fef3c7", display: "flex", alignItems: "center" },
  overdueAlert: { background: "#fef2f2", padding: "18px 30px", borderTop: "1px solid #fee2e2", display: "flex", alignItems: "center" },
  vitalsInput: { width: "80px", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px" },
  saveVitalsBtn: { background: "#065f46", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", transition: "all 0.2s" },
  toolGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  exportBtnDeep: { background: "#065f46", color: "#fff", border: "none", padding: "18px", borderRadius: "18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.2s ease" },
  exportBtnLight: { background: "#1e293b", color: "#fff", border: "none", padding: "18px", borderRadius: "18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", transition: "all 0.2s ease" },
  exportText: { textAlign: "left", display: "flex", flexDirection: "column" },
  formCard: { background: "#fff", padding: "35px", borderRadius: "24px", border: "1px solid #f1f5f9", boxShadow: "0 5px 15px rgba(0,0,0,0.02)" },
  examBtn: { background: "#065f46", color: "#fff", border: "none", padding: "18px", borderRadius: "16px", fontWeight: "900", cursor: "pointer", fontSize: "16px", width: "100%", transition: "all 0.2s ease" },
  inputRow: { display: "flex", gap: "15px", marginBottom: "15px" },
  visitorInput: { flex: 1, padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", background: "#fcfcfc" },
  visitorSelect: { flex: 1, padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "15px", backgroundColor: "#fff" },
  logVisitorBtn: { background: "#065f46", color: "#fff", border: "none", padding: "18px", borderRadius: "16px", fontWeight: "800", width: "100%", marginTop: "10px", transition: "all 0.2s ease" },
  visitorSearchInput: { padding: "10px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" },
  visitorCard: { background: "#fff", padding: "20px 25px", borderRadius: "20px", display: "flex", alignItems: "center", marginBottom: "15px", border: "1px solid #f1f5f9", transition: "all 0.2s" },
  vName: { margin: 0, fontWeight: "900", fontSize: "17px", color: "#1e293b" },
  vPurposeBadge: { fontSize: "11px", backgroundColor: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "8px", fontWeight: "800" },
  vMeta: { margin: "5px 0 0 0", fontSize: "14px", color: "#94a3b8" },
  vExitText: { margin: "5px 0 0 0", fontSize: "13px", color: "#ef4444", fontWeight: "800" },
  exitBtn: { background: "#fff", border: "1px solid #ef4444", color: "#ef4444", padding: "10px 18px", borderRadius: "12px", cursor: "pointer", fontSize: "12px", fontWeight: "800", transition: "all 0.2s" }
};