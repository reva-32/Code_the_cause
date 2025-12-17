/**
 * PROMOTION RULES
 * -----------------
 * Handles:
 * - Placement decision
 * - Promotion after topic test
 * - Content access control
 *
 * RULES:
 * - < 90%  → stay in same class
 * - ≥ 90% → promote to next class (max Class 3)
 */

/* -------------------------
   CLASS ORDER
-------------------------- */
const CLASS_ORDER = ["Class 1", "Class 2", "Class 3"];

/* -------------------------
   GET NEXT CLASS
-------------------------- */
export function getNextClass(currentClass) {
  const index = CLASS_ORDER.indexOf(currentClass);
  if (index === -1 || index === CLASS_ORDER.length - 1) {
    return currentClass; // already at max
  }
  return CLASS_ORDER[index + 1];
}

/* -------------------------
   PROMOTE STUDENT
-------------------------- */
export function applyPromotion({
  student,
  subject,
  score,
}) {
  const updatedStudent = { ...student };

  if (!updatedStudent.levels) {
    updatedStudent.levels = {};
  }

  const currentClass = updatedStudent.levels[subject];

  if (score >= 90) {
    updatedStudent.levels[subject] =
      getNextClass(currentClass);
    updatedStudent.lastResult = "PASS";
  } else {
    updatedStudent.lastResult = "FAIL";
  }

  return updatedStudent;
}

/* -------------------------
   CAN ACCESS LESSON?
-------------------------- */
export function canAccessLesson({
  student,
  lesson,
}) {
  return (
    lesson.class ===
    student.levels[lesson.subject.toLowerCase()]
  );
}

/* -------------------------
   SHOULD SHOW TEST?
-------------------------- */
export function shouldShowTest({
  student,
  lessonId,
}) {
  return !student.completedLessons?.includes(lessonId);
}

/* -------------------------
   DISABILITY CONTENT MODE
-------------------------- */
export function getContentMode(student) {
  return student.disability ? "audio" : "video";
}
