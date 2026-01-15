const CLASS_ORDER = ["Class 1", "Class 2", "Class 3"];

export function getNextClass(currentClass) {
  const index = CLASS_ORDER.indexOf(currentClass);
  if (index === -1 || index === CLASS_ORDER.length - 1) {
    return currentClass;
  }
  return CLASS_ORDER[index + 1];
}

export function applyPromotion({ student, subject, score, isFinalExam = false }) {
  const updated = { ...student };
  const subKey = subject.toLowerCase();

  // Ensure data structures exist
  if (!updated.levels) updated.levels = { maths: "Class 1", science: "Class 1" };
  if (!updated.scores) updated.scores = {};
  if (!updated.completedMathsLessons) updated.completedMathsLessons = [];
  if (!updated.completedScienceLessons) updated.completedScienceLessons = [];

  // Always save the score
  updated.scores[subject] = score;

  // --- THE SAFETY LOCK ---
  // Promotion ONLY happens if it is a Final Exam and score is high.
  if (isFinalExam === true && score >= 90) {
    const currentLevel = updated.levels[subKey] || "Class 1";
    const nextLevel = getNextClass(currentLevel);

    // Only update if there is actually a next class to go to
    if (nextLevel !== currentLevel) {
      updated.levels[subKey] = nextLevel;
      updated.lastResult = "PROMOTED";

      // Reset progress for the NEW grade level
      if (subKey === 'maths') updated.completedMathsLessons = [];
      if (subKey === 'science') updated.completedScienceLessons = [];
    }
  }
  // If it's NOT a final exam, we just record the result and STOP.
  else if (score >= 90) {
    updated.lastResult = "TOPIC_PASS";
    // levels[subKey] remains UNCHANGED here.
  } else {
    updated.lastResult = "FAIL";
  }

  return updated;
}

export function shouldShowTest({ student, lessonId }) {
  const allCompleted = [
    ...(student.completedLessons || []),
    ...(student.completedMathsLessons || []),
    ...(student.completedScienceLessons || [])
  ];
  return !allCompleted.includes(lessonId);
}

export function getContentMode(student) {
  return student.disability ? "audio" : "video";
}