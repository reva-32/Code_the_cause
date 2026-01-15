export function promoteIfEligible(student, subject, score, isFinalExam = false) {
  // 1. BLOCK: Only allow promotion if explicitly marked as Final Exam
  if (!isFinalExam) return student;

  // 2. BLOCK: Score must meet the threshold
  if (score < 90) return student;

  // 3. NORMALIZE: Ensure subject is lowercase to match your student data structure
  const subjectKey = subject.toLowerCase();
  const currentLevel = student.levels?.[subjectKey] || "Class 1";

  // 4. LIMIT: Prevent promotion beyond the highest available class
  if (currentLevel === "Class 3") return student;

  const nextClassMap = {
    "Class 1": "Class 2",
    "Class 2": "Class 3",
  };

  const nextLevel = nextClassMap[currentLevel];

  // 5. RETURN: Updated object with new level and RESET progress for that subject
  return {
    ...student,
    levels: {
      ...student.levels,
      [subjectKey]: nextLevel, // Correctly updates 'maths' or 'science'
    },
    // Clear completion arrays so the student starts at 0% in the new class
    [subjectKey === "maths" ? "completedMathsLessons" : "completedScienceLessons"]: []
  };
}