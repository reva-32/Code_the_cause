import { applyPromotion } from "../data/promotionRules";

/**
 * Handles the logic for processing test results.
 * Rename to promoteIfEligible to match TopicTest.jsx imports
 */
export const promoteIfEligible = (student, subject, score, isFinal = false) => {

  // 1. Log for debugging
  console.log(`[PromotionEngine] Subject: ${subject}, Score: ${score}, IsFinal: ${isFinal}`);

  // 2. Deep clone the student to avoid direct state mutation
  const studentCopy = JSON.parse(JSON.stringify(student));

  // 3. Call the rules engine with the strict final exam flag
  const updatedStudent = applyPromotion({
    student: studentCopy,
    subject,
    score,
    isFinalExam: isFinal
  });

  // 4. THE SAFETY GUARD:
  // If it's NOT a final exam, we forcibly ensure the level stays the same
  // This acts as a backup in case promotionRules.js has a loophole.
  if (!isFinal) {
    const subKey = subject.toLowerCase();
    if (updatedStudent.levels[subKey] !== student.levels[subKey]) {
      console.warn("Manual Reversion: Blocking unauthorized promotion.");
      updatedStudent.levels[subKey] = student.levels[subKey];
    }
  }

  return updatedStudent;
};