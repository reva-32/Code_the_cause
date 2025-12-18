const CLASS_ORDER = ["Class 1", "Class 2", "Class 3"];

export function getNextClass(currentClass) {
  const index = CLASS_ORDER.indexOf(currentClass);
  if (index === -1 || index === CLASS_ORDER.length - 1) {
    return currentClass;
  }
  return CLASS_ORDER[index + 1];
}

export function applyPromotion({ student, subject, score }) {
  const updated = { ...student };

  if (!updated.levels) updated.levels = {};
  if (!updated.scores) updated.scores = {};
  if (!updated.completedLessons) updated.completedLessons = [];

  updated.scores[subject] = score;

  if (score >= 90) {
    updated.levels[subject] = getNextClass(updated.levels[subject]);
    updated.lastResult = "PASS";
  } else {
    updated.lastResult = "FAIL";
  }

  return updated;
}

export function shouldShowTest({ student, lessonId }) {
  return !student.completedLessons.includes(lessonId);
}

export function getContentMode(student) {
  return student.disability ? "audio" : "video";
}
