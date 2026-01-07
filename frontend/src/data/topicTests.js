export const TOPIC_TEST = [
  // Class 1 - Maths Addition
  {
    topic: "Addition",
    subject: "maths",
    level: "Class1",
    questions: [
      { id: "m1t1", question: "5 + 3 = ?", options: ["8", "53", "9", "7"], answer: "8" },
      { id: "m1t2", question: "2 + 6 = ?", options: ["6", "8", "12", "4"], answer: "8" },
      { id: "m1t3", question: "4 + 7 = ?", options: ["11", "47", "10", "12"], answer: "11" },
      { id: "m1t4", question: "1 + 9 = ?", options: ["10", "19", "11", "9"], answer: "10" },
      { id: "m1t5", question: "3 + 5 = ?", options: ["8", "35", "7", "9"], answer: "8" },
    ],
  },

  // Class 1 - Science Good vs Bad Habits
  {
    topic: "Good vs Bad Habits",
    subject: "science",
    level: "Class1",
    questions: [
      { id: "s1t1", question: "Brushing teeth daily is a...", options: ["Good habit", "Bad habit"], answer: "Good habit" },
      { id: "s1t2", question: "Eating junk food always is a...", options: ["Good habit", "Bad habit"], answer: "Bad habit" },
      { id: "s1t3", question: "Washing hands before meals is a...", options: ["Good habit", "Bad habit"], answer: "Good habit" },
      { id: "s1t4", question: "Not sleeping on time is a...", options: ["Good habit", "Bad habit"], answer: "Bad habit" },
      { id: "s1t5", question: "Helping parents at home is a...", options: ["Good habit", "Bad habit"], answer: "Good habit" },
    ],
  },

  // Class 2 - Maths Multiplication
  {
    topic: "Multiplication",
    subject: "maths",
    level: "Class2",
    questions: [
      { id: "m2t1", question: "6 × 7 = ?", options: ["42", "13", "67", "36"], answer: "42" },
      { id: "m2t2", question: "5 × 8 = ?", options: ["40", "13", "58", "35"], answer: "40" },
      { id: "m2t3", question: "4 × 9 = ?", options: ["36", "49", "45", "34"], answer: "36" },
      { id: "m2t4", question: "3 × 7 = ?", options: ["21", "37", "17", "24"], answer: "21" },
      { id: "m2t5", question: "8 × 6 = ?", options: ["48", "86", "14", "56"], answer: "48" },
    ],
  },

  // Class 2 - Science Water Cycle
  {
    topic: "Water Cycle",
    subject: "science",
    level: "Class2",
    questions: [
      { id: "s2t1", question: "Rain is an example of which process?", options: ["Evaporation", "Precipitation", "Condensation", "Freezing"], answer: "Precipitation" },
      { id: "s2t2", question: "Water vapor turns into clouds by?", options: ["Condensation", "Evaporation", "Melting", "Freezing"], answer: "Condensation" },
      { id: "s2t3", question: "Sun heats water causing it to rise is called?", options: ["Evaporation", "Precipitation", "Condensation", "Freezing"], answer: "Evaporation" },
      { id: "s2t4", question: "Ice turning into water is called?", options: ["Melting", "Freezing", "Evaporation", "Condensation"], answer: "Melting" },
      { id: "s2t5", question: "Clouds release water as?", options: ["Rain", "Sunlight", "Fog", "Dew"], answer: "Rain" },
    ],
  },

  // Class 3 - Science Living and Non-living
  {
    topic: "Living and Non-living",
    subject: "science",
    level: "Class3",
    questions: [
      { id: "s3t1", question: "Which is non-living?", options: ["Dog", "Rock", "Tree", "Fish"], answer: "Rock" },
      { id: "s3t2", question: "Which is living?", options: ["Stone", "Car", "Plant", "Water"], answer: "Plant" },
      { id: "s3t3", question: "A dog is?", options: ["Living", "Non-living"], answer: "Living" },
      { id: "s3t4", question: "A chair is?", options: ["Living", "Non-living"], answer: "Non-living" },
      { id: "s3t5", question: "Trees need sunlight and water to?", options: ["Grow", "Sleep", "Run", "Sing"], answer: "Grow" },
    ],
  },
];

// NEW: Simplification logic - reduces complexity but keeps total count exact
export function getSimplifiedQuestions(questions, subject) {
  return questions.map((q, index) => {
    if (subject === "maths") {
      // Logic: Convert complex math to basic addition/identity
      return { 
        ...q, 
        question: `Basic Task ${index + 1}: ${index + 1} + 1 = ?`, 
        options: [`${index + 2}`, `${index + 5}`, "0", "10"], 
        answer: `${index + 2}` 
      };
    } else {
      // Logic: Simplify Science to Yes/No or Basic Identification
      return { 
        ...q, 
        question: `Simple Science: Is a ${q.answer} something we can see?`, 
        options: ["Yes", "No", "Maybe", "Never"], 
        answer: "Yes" 
      };
    }
  });
}

export function evaluateTopicTest(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}