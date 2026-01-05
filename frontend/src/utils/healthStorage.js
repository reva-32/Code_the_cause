// frontend/src/utils/healthStorage.js

// Keep your existing keys
const GUARDIAN_HEALTH_KEY = "health_guardian_profiles";
const MENTAL_HEALTH_KEY = "health_mental_weekly";
const PHYSICAL_HEALTH_KEY = "health_physical_updates";
const ADMIN_CONTENT_KEY = "health_admin_content";

const readJSON = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

const writeJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// =====================
// Student Mental Health (UPDATED WITH ALERT LOGIC)
// =====================

export const addMentalHealthEntry = (studentName, entry) => {
    const allLogs = readJSON(MENTAL_HEALTH_KEY, {});

    if (!allLogs[studentName]) {
        allLogs[studentName] = [];
    }

    // 1. Calculate Alert Status for this entry
    // Scoring: Low mood (1-2), High stress (4-5), Worry (Often)
    let alertLevel = "none";
    let alertReason = "";

    if (entry.mood <= 2 || entry.worry === "Often") {
        alertLevel = "critical"; // Red Alert
        alertReason = "Emotional Distress Detected";
    } else if (entry.stress >= 4 || entry.sleep <= 2) {
        alertLevel = "warning"; // Orange Alert
        alertReason = "High Stress/Exhaustion";
    }

    // 2. Save the log with the calculated alert
    allLogs[studentName].push({
        ...entry,
        date: new Date().toISOString(),
        alertLevel,
        alertReason
    });

    writeJSON(MENTAL_HEALTH_KEY, allLogs);
};

// Helper for Dashboard: Get the latest alert for a student
export const getStudentAlertStatus = (studentName) => {
    const logs = getMentalHealthLogs(studentName);
    if (logs.length === 0) return { level: "none", reason: "" };

    // Get the most recent entry
    const latest = logs[logs.length - 1];
    return {
        level: latest.alertLevel || "none",
        reason: latest.alertReason || ""
    };
};

// Helper for Report: Get tips for the guardian based on the latest data
export const getGuardianSupportTips = (studentName) => {
    const logs = getMentalHealthLogs(studentName);
    if (logs.length === 0) return ["Encourage your child to complete their first wellness check!"];

    const latest = logs[logs.length - 1];
    const tips = [];

    if (latest.mood <= 2) tips.push("Ask open-ended questions about their day to encourage sharing.");
    if (latest.stress >= 4) tips.push("Consider reducing extracurricular load this week to lower stress.");
    if (latest.sleep <= 2) tips.push("Establish a 'no-screen' rule 1 hour before bedtime.");
    if (latest.social === "Rarely" || latest.social === "Not at all")
        tips.push("Organize a low-pressure social activity or hobby they enjoy.");
    if (latest.worry === "Often") tips.push("Practice simple mindfulness or breathing exercises together.");

    return tips.length > 0 ? tips : ["Your child seems to be doing well! Maintain the current routine."];
};

// =====================
// EXISTING FUNCTIONS (Keep as is)
// =====================

export const getMentalHealthLogs = (studentName) => {
    const allLogs = readJSON(MENTAL_HEALTH_KEY, {});
    return allLogs[studentName] || [];
};

export const saveGuardianHealthProfile = (studentName, profile) => {
    const allProfiles = readJSON(GUARDIAN_HEALTH_KEY, {});
    allProfiles[studentName] = { ...profile, lastUpdated: new Date().toISOString() };
    writeJSON(GUARDIAN_HEALTH_KEY, allProfiles);
};

export const getGuardianHealthProfile = (studentName) => {
    const allProfiles = readJSON(GUARDIAN_HEALTH_KEY, {});
    return allProfiles[studentName] || null;
};

export const shouldShowMentalHealthCheck = (studentName) => {
    const logs = getMentalHealthLogs(studentName);
    if (logs.length === 0) return true;
    const lastEntry = logs[logs.length - 1];
    const lastDate = new Date(lastEntry.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
};

export const addHeightWeightUpdate = (studentName, height, weight) => {
    const allData = readJSON(PHYSICAL_HEALTH_KEY, {});
    if (!allData[studentName]) allData[studentName] = { heightWeightHistory: [], monthlyHealthChecks: [] };
    allData[studentName].heightWeightHistory.push({ height, weight, date: new Date().toISOString() });
    writeJSON(PHYSICAL_HEALTH_KEY, allData);
};

export const addMonthlyHealthCheck = (studentName, check) => {
    const allData = readJSON(PHYSICAL_HEALTH_KEY, {});
    if (!allData[studentName]) allData[studentName] = { heightWeightHistory: [], monthlyHealthChecks: [] };
    allData[studentName].monthlyHealthChecks.push({ ...check, date: new Date().toISOString() });
    writeJSON(PHYSICAL_HEALTH_KEY, allData);
};

export const getPhysicalHealthData = (studentName) => {
    const allData = readJSON(PHYSICAL_HEALTH_KEY, {});
    return allData[studentName] || { heightWeightHistory: [], monthlyHealthChecks: [] };
};

export const addAdminHealthContent = (content) => {
    const allContent = readJSON(ADMIN_CONTENT_KEY, []);
    allContent.push({ id: Date.now(), ...content, createdAt: new Date().toISOString() });
    writeJSON(ADMIN_CONTENT_KEY, allContent);
};

export const getAdminHealthContent = () => readJSON(ADMIN_CONTENT_KEY, []);