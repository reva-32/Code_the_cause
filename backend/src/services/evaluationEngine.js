import { percentage } from "../utils/scoreUtils.js";

export const evaluate = (questions, answers) => {
  let correct = 0;
  questions.forEach((q, i) => {
    if (q.correctAnswer === answers[i]) correct++;
  });
  return percentage(correct, questions.length);
};
