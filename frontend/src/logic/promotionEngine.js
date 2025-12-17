export function promoteIfEligible(student, subject, score) {
  if (score < 90) return student;

  const current = student.levels[subject];
  if (current === "Class 3") return student;

  const nextClass = {
    "Class 1": "Class 2",
    "Class 2": "Class 3",
  };

  return {
    ...student,
    levels: {
      ...student.levels,
      [subject]: nextClass[current],
    },
  };
}
