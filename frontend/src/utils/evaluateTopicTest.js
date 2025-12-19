export function evaluateTopicTest(questions, answers) {
  let correct = 0;
  questions.forEach((q, index) => {
    if (answers[index] === q.answer) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}
