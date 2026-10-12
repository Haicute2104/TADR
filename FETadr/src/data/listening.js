const books = [
  { book: "KET 5", group: 1 },
  { book: "KET 6", group: 2 },
  { book: "KET 7", group: 3 },
]

const part1Keys = {
  1: ["A", "C", "C", "B", "B"],
  2: ["A", "C", "A", "A", "B"],
  3: ["B", "A", "A", "C", "A"],
  4: ["B", "A", "C", "A", "B"],
  5: ["A", "C", "B", "C", "C"],
  6: ["C", "B", "B", "B", "A"],
  7: ["C", "A", "B", "B", "C"],
  8: ["A", "B", "B", "C", "B"],
  9: ["A", "C", "A", "B", "C"],
  10: ["B", "B", "C", "A", "A"],
  11: ["A", "C", "A", "A", "B"],
  12: ["A", "B", "B", "C", "B"],
}

const part2Keys = {
  1: ["G", "C", "E", "F", "D"],
  2: ["F", "B", "G", "D", "A"],
  3: ["G", "D", "B", "A", "H"],
  4: ["E", "B", "H", "G", "F"],
  5: ["D", "F", "H", "A", "B"],
  6: ["A", "D", "F", "E", "H"],
  7: ["C", "D", "A", "H", "G"],
  8: ["G", "E", "B", "F", "A"],
  9: ["A", "E", "G", "D", "B"],
  10: ["B", "H", "E", "D", "G"],
  11: ["A", "F", "B", "C", "E"],
  12: ["F", "D", "C", "A", "E"],
}

const part3Keys = {
  1: ["B", "A", "C", "C", "B"],
}

function answerMap(letters, questions) {
  return Object.fromEntries(questions.map((number, index) => [number, letters[index]]))
}

function testsForPart(part, pagesOf, keyBook, questions) {
  const tests = []
  books.forEach(({ book, group }) => {
    for (let test = 1; test <= 4; test += 1) {
      const index = (group - 1) * 4 + test
      const letters = keyBook[index]
      tests.push({
        id: `${part}-${book.replace(" ", "")}-T${test}`,
        title: `${book} · Test ${test}`,
        audio: part === "p3" && !(group === 1 && test === 1) ? null : `/media/listening/audio/L_${part.slice(1)}_${group}_${test}.mp3`,
        pages: pagesOf(index).map((page) => `/media/listening/${part}/${String(page).padStart(2, "0")}.png`),
        answers: letters ? answerMap(letters, questions) : null,
      })
    }
  })
  return tests
}

export const listeningParts = [
  {
    id: "p1",
    title: "Phần 1 · Chọn tranh",
    instruction: "Nghe 5 đoạn hội thoại ngắn, chọn tranh A, B hoặc C.",
    pointsEach: 1.5,
    max: 7.5,
    choices: ["A", "B", "C"],
    questions: [1, 2, 3, 4, 5],
    tests: testsForPart("p1", (index) => {
      if (index <= 9) {
        const start = (index - 1) * 2 + 1
        return [start, start + 1]
      }
      if (index === 10) return [19, 20, 21, 22]
      if (index === 11) return [23, 24]
      return [25, 26]
    }, part1Keys, [1, 2, 3, 4, 5]),
  },
  {
    id: "p2",
    title: "Phần 2 · Nối thông tin",
    instruction: "Nghe hội thoại và điền chữ A–H cho câu 6–10.",
    pointsEach: 1.25,
    max: 6.25,
    choices: ["A", "B", "C", "D", "E", "F", "G", "H"],
    questions: [6, 7, 8, 9, 10],
    tests: testsForPart("p2", (index) => [index], part2Keys, [6, 7, 8, 9, 10]),
  },
  {
    id: "p3",
    title: "Phần 3 · Trắc nghiệm hội thoại",
    instruction: "Nghe đối thoại và chọn A, B hoặc C cho câu 11–15. Bộ file hiện chỉ có audio của KET 5 Test 1.",
    pointsEach: 1.25,
    max: 6.25,
    choices: ["A", "B", "C"],
    questions: [11, 12, 13, 14, 15],
    tests: testsForPart("p3", (index) => [index], part3Keys, [11, 12, 13, 14, 15]),
  },
]
