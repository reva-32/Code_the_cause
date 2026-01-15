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

  if (!updated.levels) updated.levels = {};
  if (!updated.scores) updated.scores = {};

  // Initialize subject-specific completion if not present
  if (!updated.completedMathsLessons) updated.completedMathsLessons = [];
  if (!updated.completedScienceLessons) updated.completedScienceLessons = [];

  updated.scores[subject] = score;

  // BLOCK PROMOTION unless it's a Final Exam
  if (isFinalExam && score >= 90) {
    const currentLevel = updated.levels[subKey] || "Class 1";
    updated.levels[subKey] = getNextClass(currentLevel);
    updated.lastResult = "PROMOTED";

    // Reset lessons for the NEW class level
    if (subKey === 'maths') updated.completedMathsLessons = [];
    if (subKey === 'science') updated.completedScienceLessons = [];

  } else if (score >= 90) {
    updated.lastResult = "TOPIC_PASS"; // Level remains the same
  } else {
    updated.lastResult = "FAIL";
  }

  return updated;
}

export function shouldShowTest({ student, lessonId }) {
  // Check both global and subject-specific arrays for safety
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