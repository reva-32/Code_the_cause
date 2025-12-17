export function evaluateTest(questions, answers) {
  let correct = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });

  return Math.round((correct / questions.length) * 100);
}
