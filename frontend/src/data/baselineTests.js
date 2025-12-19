// ================= BASELINE / PLACEMENT TEST =================
export const BASELINE_TEST = [
  {
    id: "m1",
    subject: "maths",
    level: "Class1",
    question: "4 birds + 2 birds = ?",
    options: ["6", "42", "2", "8"],
    answer: "6",
  },
  {
    id: "s1",
    subject: "science",
    level: "Class1",
    question: "Which animal can fly?",
    options: ["Dog", "Cat", "Bird", "Elephant"],
    answer: "Bird",
  },
  {
    id: "m2",
    subject: "maths",
    level: "Class2",
    question: "3 × 4 = ?",
    options: ["7", "12", "34", "9"],
    answer: "12",
  },
  {
    id: "s2",
    subject: "science",
    level: "Class2",
    question: "Which process turns water into vapor?",
    options: ["Evaporation", "Condensation", "Precipitation", "Freezing"],
    answer: "Evaporation",
  },
  {
    id: "s3",
    subject: "science",
    level: "Class3",
    question: "Which of these is a living thing?",
    options: ["Rock", "Tree", "Chair", "Pen"],
    answer: "Tree",
  },
];

// ================= TOPIC TEST (ONLY THIS IS USED FOR RETAKE) =================
export const TOPIC_TEST = [
  {
    topic: "Addition",
    subject: "maths",
    level: "Class1",
    questions: [
      { question: "5 + 3 = ?", options: ["8", "53", "9", "7"], answer: "8" },
      { question: "2 + 6 = ?", options: ["6", "8", "12", "4"], answer: "8" },
      { question: "4 + 7 = ?", options: ["11", "47", "10", "12"], answer: "11" },
      { question: "1 + 9 = ?", options: ["10", "19", "11", "9"], answer: "10" },
      { question: "3 + 5 = ?", options: ["8", "35", "7", "9"], answer: "8" },
    ],
  },

  {
    topic: "Multiplication",
    subject: "maths",
    level: "Class2",
    questions: [
      { question: "6 × 7 = ?", options: ["42", "13", "67", "36"], answer: "42" },
      { question: "5 × 8 = ?", options: ["40", "13", "58", "35"], answer: "40" },
      { question: "4 × 9 = ?", options: ["36", "49", "45", "34"], answer: "36" },
      { question: "3 × 7 = ?", options: ["21", "37", "17", "24"], answer: "21" },
      { question: "8 × 6 = ?", options: ["48", "86", "14", "56"], answer: "48" },
    ],
  },

  {
    topic: "Water Cycle",
    subject: "science",
    level: "Class2",
    questions: [
      { question: "Rain is?", options: ["Evaporation", "Precipitation"], answer: "Precipitation" },
      { question: "Clouds form by?", options: ["Condensation", "Freezing"], answer: "Condensation" },
      { question: "Sun heats water is?", options: ["Evaporation", "Melting"], answer: "Evaporation" },
    ],
  },
];

// ================= HELPERS =================
export function evaluateTopicTest(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}
