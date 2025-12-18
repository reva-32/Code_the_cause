export function evaluateBaseline(answers, testData) {
  const score = {
    Maths: { Class1: 0, Class2: 0 },
    Science: { Class1: 0, Class2: 0 }
  };

  testData.forEach((q) => {
    if (answers[q.id] === q.answer) {
      score[q.subject][q.level]++;
    }
  });

  return {
    Maths: score.Maths.Class2 >= 1 ? "Class 2" : "Class 1",
    Science: score.Science.Class2 >= 1 ? "Class 2" : "Class 1"
  };
}
