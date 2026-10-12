import questions from "./grammarQuestions.json"

export const grammarQuestions = questions

export function grammarAnswer(number) {
  return questions.find((item) => item.number === Number(number))?.answer ?? null
}

export const grammarQuestionList = questions
