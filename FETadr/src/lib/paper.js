import { grammarQuestionList } from "../data/grammar"
import { letters } from "../data/letters"
import { listeningParts } from "../data/listening"
import { readingItems } from "../data/reading"
import { speakingTopics } from "../data/speaking"
import writingItems from "../data/writingItems.json"

const writingCategories = [
  "past-perfect",
  "comparison",
  "relative",
  "cond1",
  "cond2",
  "reported",
  "modal",
  "although",
]

function shuffle(list) {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swap]
    copy[swap] = current
  }
  return copy
}

export function buildPaper() {
  const listening = listeningParts.map((part) => {
    const pool = part.tests.filter((item) => item.answers)
    const test = pool[Math.floor(Math.random() * pool.length)]
    return { partId: part.id, testId: test.id }
  })
  const grammar = shuffle(grammarQuestionList).slice(0, 10).map((item) => item.number)
  const notices = shuffle(readingItems).slice(0, 5).map((item) => item.id)
  const writing = shuffle(writingCategories)
    .slice(0, 5)
    .map((category) => {
      const pool = writingItems.filter((item) => item.category === category)
      return pool[Math.floor(Math.random() * pool.length)].id
    })
  const letter = letters[Math.floor(Math.random() * letters.length)].id
  const speaking = speakingTopics[Math.floor(Math.random() * speakingTopics.length)].id
  return {
    id: `${Date.now()}`,
    createdAt: Date.now(),
    listening,
    grammar,
    notices,
    writing,
    letter,
    speaking,
  }
}

export { writingItems }
