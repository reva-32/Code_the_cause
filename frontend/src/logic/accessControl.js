export function canAccessLesson(student, subject, lesson) {
  // disability filter
  if (student.disability && !lesson.audio) return false;
  if (!student.disability && !lesson.video) return false;

  // class filter
  return (
    lesson.id.startsWith(subject[0]) &&
    lessonAllowedForClass(student, subject, lesson)
  );
}

function lessonAllowedForClass(student, subject, lesson) {
  const level = student.levels[subject];
  return lesson.id.includes(level.split(" ")[1]);
}
